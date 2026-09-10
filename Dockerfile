FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN sed -i 's/\r$//' mvnw
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/Student_Info_Management_System-0.0.1-SNAPSHOT.jar"]
