# Task Manager

Agenda de tareas con API REST e interfaz web, desarrollada con Java y Spring Boot.

## Descripción
Permite crear, consultar, editar, marcar como completadas y eliminar tareas. El backend expone una API REST que guarda los datos en una base de datos H2, valida la información que recibe y devuelve mensajes de error claros. Una interfaz web permite usar la aplicación desde el navegador.

## Tecnologías
- Java 17
- Spring Boot (Web, Data JPA, Validation)
- Base de datos H2
- HTML, CSS y JavaScript
- JUnit y MockMvc

## Funcionalidades
- CRUD de tareas (título, descripción, fecha límite, estado, prioridad y categoría)
- Validación de datos y respuestas de error claras
- Interfaz web con progreso, contadores, búsqueda y filtros
- Tests automatizados de la API

## Cómo ejecutarlo
```
git clone https://github.com/MoadMergoum/Gestor_De_Tareas.git
cd Gestor_De_Tareas
./mvnw spring-boot:run
```
Abre `http://localhost:8080` en el navegador.


