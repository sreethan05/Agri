@echo off
title Jenkins CI/CD Server (Port 8080)
echo ========================================================
echo Starting Jenkins CI/CD Server on http://localhost:8080
echo ========================================================
java -jar "C:\Users\USER\jenkins\jenkins.war" --enable-future-java --httpPort=8080
pause
