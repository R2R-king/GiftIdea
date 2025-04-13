@echo off
echo Starting GiftIdea Backend Server with Spring Boot...
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
pause 