pipeline {
    agent any

    environment {
        APP_NAME    = 'agri'
        GIT_REPO    = 'https://github.com/sreethan05/Agri.git'
        PYTHONUNBUFFERED = '1'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "=========================================="
                echo "Stage 1: Checking out Agri project repository"
                echo "=========================================="
                checkout scm
            }
        }

        stage('Backend Unit & Integration Tests') {
            steps {
                echo "=========================================="
                echo "Stage 2: Executing Backend Automated Tests"
                echo "=========================================="
                script {
                    if (isUnix()) {
                        sh '''
                            python3 -m venv .ci_venv || python -m venv .ci_venv
                            . .ci_venv/bin/activate
                            pip install --upgrade pip
                            pip install -r backend/requirements.txt
                            python backend/tests/test_api.py
                        '''
                    } else {
                        bat '''
                            python -m venv .ci_venv
                            call .ci_venv\\Scripts\\activate
                            python -m pip install --upgrade pip
                            pip install -r backend\\requirements.txt
                            python backend\\tests\\test_api.py
                        '''
                    }
                }
            }
        }

        stage('Frontend Build & Validation') {
            steps {
                echo "=========================================="
                echo "Stage 3: Building Production Frontend"
                echo "=========================================="
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh '''
                                npm ci || npm install
                                npm run build
                            '''
                        } else {
                            bat '''
                                call npm install
                                call npm run build
                            '''
                        }
                    }
                }
            }
        }

        stage('Docker Container Build') {
            steps {
                echo "=========================================="
                echo "Stage 4: Building Multi-Container Docker Images"
                echo "=========================================="
                script {
                    if (isUnix()) {
                        sh 'docker compose build || docker-compose build'
                    } else {
                        bat 'docker compose build'
                    }
                }
            }
        }

        stage('Deploy & Health Smoke Test') {
            steps {
                echo "=========================================="
                echo "Stage 5: Deploying Containers & Smoke Testing"
                echo "=========================================="
                script {
                    if (isUnix()) {
                        sh '''
                            docker compose up -d || docker-compose up -d
                            sleep 10
                            curl -f http://localhost:8000/health || exit 1
                            docker compose down || docker-compose down
                        '''
                    } else {
                        bat '''
                            docker compose up -d
                            timeout /t 10 /nobreak
                            curl -f http://localhost:8000/health
                            docker compose down
                        '''
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo "=========================================="
                echo "Stage 6: Archiving Build Artifacts"
                echo "=========================================="
                archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "Pipeline run completed."
            cleanWs(cleanWhenAborted: false, deleteDirs: true)
        }
        success {
            echo "=========================================="
            echo "✅ Agri CI/CD Pipeline succeeded successfully!"
            echo "All tests passed and containers built."
            echo "=========================================="
        }
        failure {
            echo "=========================================="
            echo "❌ Agri CI/CD Pipeline encountered errors."
            echo "Review stage logs for troubleshooting."
            echo "=========================================="
        }
    }
}
