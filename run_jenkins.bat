@echo off
title Jenkins CI/CD Server
echo Starting Jenkins CI/CD Server on http://localhost:8085 ...
java -jar "C:\Users\USER\jenkins\jenkins.war" --enable-future-java --httpPort=8085
pause
