const { app, BrowserWindow, session } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Detect if we are in production or development
const isDev = !app.isPackaged;

let mainWindow;
let backendProcess;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready-to-show to prevent white flicker
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  // Grant geolocation permissions automatically
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'geolocation') {
      callback(true);
    } else {
      callback(false);
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const prodPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(prodPath)) {
      mainWindow.loadFile(prodPath);
    } else {
      console.error("❌ Production build (dist/index.html) not found!");
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
};

const getBackendCommand = () => {
  if (isDev) {
    // Development: assuming backend folder is next to frontend
    return {
      command: 'python',
      args: [path.join(__dirname, '..', 'backend', 'main.py')],
    };
  }

  // PRODUCTION: Expecting main.exe inside the extraResources folder (backend/)
  const exePath = path.join(process.resourcesPath, 'backend', 'main.exe');

  if (fs.existsSync(exePath)) {
    return { command: exePath, args: [] };
  }

  throw new Error(`Backend executable not found at: ${exePath}`);
};

const startBackend = () => {
  try {
    const backend = getBackendCommand();
    
    const env = { 
      ...process.env, 
      PYTHONUTF8: "1", 
      PYTHONIOENCODING: "UTF-8" 
    };

    backendProcess = spawn(backend.command, backend.args, {
      cwd: isDev ? path.join(__dirname, '..', 'backend') : path.dirname(backend.command),
      env: env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Python Stdout]: ${data.toString()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Python Stderr]: ${data.toString()}`);
    });

    backendProcess.on('error', (err) => {
      console.error("Failed to start backend process:", err);
    });

  } catch (err) {
    console.error("CRITICAL: Backend failed to start:", err.message);
  }
};

app.on('ready', () => {
  startBackend();
  // Wait for the backend to warm up before showing the UI
  setTimeout(createWindow, 2500); 
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    if (process.platform === 'win32') {
      // kills the process tree so orphaned python processes don't stay alive
      spawn("taskkill", ["/pid", backendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill();
    }
  }
  if (process.platform !== 'darwin') app.quit();
});
