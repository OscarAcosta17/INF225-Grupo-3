<div align="center">

# ChambaHub

**Portal de prácticas del Departamento de Informática — UTFSM**

*Conectando oportunidades entre estudiantes, empresas y el Departamento.*

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## Sobre el proyecto

Hoy el portal de prácticas del Departamento de Informática funciona principalmente como un mural de ofertas: no existe una conexión real entre estudiantes y empresas, por lo que el proceso termina ocurriendo en medios externos.

**ChambaHub** es un MVP que centraliza el ciclo completo de una práctica profesional:

1. La **empresa** publica una oferta.
2. El **estudiante** busca, filtra y postula con su perfil y CV.
3. La empresa revisa las postulaciones.
4. *(Iteración 2)* El estudiante registra su bitácora y el **encargado de convalidación** revisa y resuelve el trámite.

Proyecto desarrollado para el ramo **INF225 — Ingeniería de Software**, Universidad Técnica Federico Santa María (Segundo semestre 2026), **Grupo N° 3**.

## Funcionalidades

| Estado | Funcionalidad |
|:---:|---|
| ✅ | Registro e inicio de sesión para estudiantes y empresas |
| ✅ | Perfil del estudiante: datos de contacto, descripción, competencias técnicas y CV |
| ✅ | Publicación y edición de ofertas (modalidad, remuneración, duración, localidad, competencias requeridas) |
| ✅ | Catálogo de ofertas con filtros de búsqueda |
| ✅ | Postulación centralizada con verificación de requisitos y confirmación |
| ✅ | Seguimiento de postulaciones (estudiante) y revisión por oferta (empresa) |
| 🔜 | Autenticación institucional `@usm.cl` (RS8) |
| 🔜 | Bitácora diaria (RS12) |
| 🔜 | Gestión del trámite de convalidación (RS7) — Iteración 2 |

## Arquitectura

Arquitectura por capas, integrada mediante una API REST y contenerizada con Docker Compose.

```
┌──────────────────────┐     HTTP / JSON     ┌──────────────────────┐     SQL     ┌──────────────────┐
│  Frontend (React)    │ ──────────────────▶ │  Backend (Express)   │ ──────────▶ │   PostgreSQL     │
│  Vite · puerto 3000  │                     │  API REST · pto 4000 │             │   puerto 5432    │
└──────────────────────┘                     └──────────────────────┘             └──────────────────┘
```

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Presentación | React + Vite + React Router | Interfaz de estudiantes y empresas |
| Lógica de negocio | Node.js + Express | Reglas de negocio, postulaciones, subida de CV |
| Datos | PostgreSQL + `pg` | Usuarios, perfiles, ofertas, competencias y postulaciones |

## Estructura del repositorio

```
mi-proyecto-node-docker/
├── docker-compose.yml        # Orquesta frontend, backend y base de datos
├── index.js                  # Punto de entrada del backend
├── initDB.js                 # Crea las tablas y carga datos de prueba
├── src/
│   ├── routes/               # Definición de endpoints
│   ├── controllers/          # Manejo de peticiones
│   └── services/             # Lógica de negocio
└── frontend/
    └── src/pages/            # Pantallas de la aplicación
```

## Cómo ejecutarlo en tu computador

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado **y abierto**.
- En Windows: tener WSL2 activado (Docker Desktop lo configura al instalarse).

### Pasos

1. **Descarga el proyecto**: en esta página pulsa **Code → Download ZIP** y descomprímelo
   (o, si usas Git: `git clone https://github.com/OscarAcosta17/INF225-Grupo-3.git`).
2. **Abre una terminal** dentro de la carpeta `mi-proyecto-node-docker`.
3. **Levanta el sistema**:

   ```bash
   docker compose up --build
   ```

   La primera vez demora unos minutos mientras se instalan las dependencias.
4. **Abre la aplicación** en el navegador: <http://localhost:3000>

### Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | `estudiante@usm.cl` | `1234` |
| Empresa | `empresa@tech.com` | `1234` |

### Servicios y puertos

| Servicio | URL |
|---|---|
| Aplicación web (frontend) | <http://localhost:3000> |
| API (backend) | <http://localhost:4000> |
| Base de datos | `localhost:5432` |

### Comandos útiles

| Acción | Comando |
|---|---|
| Iniciar sin reconstruir | `docker compose up` |
| Iniciar en segundo plano | `docker compose up -d` |
| Ver estado de los servicios | `docker compose ps` |
| Ver logs en tiempo real | `docker compose logs -f` |
| Detener los contenedores | `docker compose down` |
| Detener y **borrar la base de datos** | `docker compose down -v` |

### Problemas frecuentes

- **"Cannot connect to the Docker daemon"**: abre Docker Desktop y espera a que indique que está en ejecución.
- **"port is already allocated"**: otro programa usa el puerto 3000, 4000 o 5432. Ciérralo y vuelve a intentar.
- **No avanza o hay errores raros**: asegúrate de estar dentro de la carpeta `mi-proyecto-node-docker` (donde está `docker-compose.yml`).

## Estado actual y próximos pasos

- **Iteración 1 (Hito 4):** búsqueda y postulación de prácticas.
- **Iteración 2 (Hito 5):** cierre del proceso y convalidación.

Pendientes conocidos para antes de la versión final:

- Integrar la autenticación institucional (`@usm.cl`).
- Almacenar las contraseñas cifradas (hoy son datos de prueba).
- Implementar bitácora y convalidación.

## Equipo

| Integrante | Rol |
|---|---|
| Danae Ojeda | Jefa de proyecto (JP) |
| Victor Salinas | QA |
| Catalina Díaz | Desarrollo |
| Oscar Acosta | Desarrollo |
| Jose Contreras | Desarrollo |
| Adrian Rangel | Desarrollo |

**Cliente:** Lioubov Dombrovskaia

---

<div align="center">
<sub>Universidad Técnica Federico Santa María · Departamento de Informática · INF225 · 2026</sub>
</div>
