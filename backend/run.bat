@echo off
echo Running Spring Boot application with Maven...
set MAVEN_HOME=%~dp0..\tools\apache-maven-3.9.6
"%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run
pause 