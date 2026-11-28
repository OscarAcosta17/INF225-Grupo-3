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

El portal de prácticas del Departamento de Informática funciona principalmente como un mural de ofertas: no existe una conexión directa entre estudiantes y empresas, las ofertas pueden quedar desactualizadas y parte del proceso ocurre en medios externos, dificultando su seguimiento.

**ChambaHub** es un MVP que centraliza el ciclo completo de una práctica profesional:

1. La **empresa** publica una oferta.
2. El **estudiante** busca, filtra y consulta recomendaciones según sus competencias.
3. El estudiante postula con su perfil y CV.
4. La empresa acepta o rechaza la postulación y el estudiante recibe una notificación por correo.
5. El estudiante registra su bitácora diaria durante la práctica.
6. El **encargado de convalidación** revisa y resuelve el trámite, con participación del supervisor y posibilidad de apelación.

Proyecto desarrollado para el ramo **INF225 — Ingeniería de Software**, Universidad Técnica Federico Santa María (Segundo semestre 2026), **Grupo N° 3**.

## Funcionalidades

| Estado | Funcionalidad | Requisito |
|:---:|---|:---:|
| ✅ | Registro e inicio de sesión para estudiantes y empresas | — |
| ✅ | Perfil del estudiante: datos de contacto, descripción, competencias técnicas y CV | RS1 |
| ✅ | Publicación y edición de ofertas (modalidad, remuneración, duración, localidad y competencias requeridas) | RS2 |
| ✅ | Catálogo de ofertas vigentes con filtros de búsqueda y opción de limpiarlos | RS3 |
| ✅ | Postulación centralizada con verificación de requisitos, vigencia y confirmación | RS4 |
| ✅ | Seguimiento de postulaciones, aceptación o rechazo por la empresa y notificación por correo | RS5 |
| ✅ | Caducidad automática de ofertas y postulaciones sin respuesta | RS6 |
| 🧪 | Gestión del trámite de convalidación, evaluación del supervisor, resolución, apelación y documentación PDF | RS7 |
| ✅ | Verificación del correo institucional `@usm.cl` mediante código | RS8 |
| ✅ | Recomendación de ofertas según competencias y métricas | RS9 |
| ✅ | Configuración centralizada de plazos | RS11 |
| ✅ | Bitácora diaria y resumen de horas | RS12 |

**Leyenda:** ✅ Implementado · 🧪 Implementado en fase beta.

La implementación de un requisito no implica necesariamente su verificación completa por QA.

### Convalidación de prácticas

El sistema contempla dos modalidades:

- **Práctica nueva:** solicitud del estudiante, confirmación del supervisor, bitácora diaria, informe final, evaluación del supervisor y resolución del encargado.
- **Experiencia ya realizada:** registro del tipo y duración de la experiencia, datos de la actividad, documentación PDF, evaluación del supervisor y resolución del encargado.

En caso de rechazo, el estudiante puede apelar para que el encargado revise nuevamente la solicitud.

El módulo de convalidación se encuentra en fase beta al cierre del Hito 5.

### Procesos automáticos

- Revisión de caducidad de ofertas y postulaciones cada 10 minutos.
- Gestión del abandono de postulaciones sin respuesta según los plazos configurados.
- Notificación por correo al estudiante cuando la empresa acepta o rechaza su postulación.
- Validación de vigencia de la oferta para impedir postulaciones a ofertas caducadas.

## Arquitectura

Arquitectura por capas, integrada mediante una API REST y contenerizada con Docker Compose.

```text
┌──────────────────────┐     HTTP / JSON     ┌──────────────────────┐     SQL     ┌──────────────────┐
│  Frontend (React)    │ ──────────────────▶ │  Backend (Express)   │ ──────────▶ │   PostgreSQL     │
│  Vite · puerto 3000  │                     │  API REST · pto 4000 │             │   puerto 5432    │
└──────────────────────┘                     └──────────────────────┘             └──────────────────┘
```

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Presentación | React + Vite + React Router | Interfaces de los usuarios y gestión del flujo de prácticas |
| Lógica de negocio | Node.js + Express | Reglas de negocio, postulaciones, subida de CV, recomendaciones, caducidad, notificaciones y convalidación |
| Datos | PostgreSQL + `pg` | Persistencia de usuarios, perfiles, ofertas, competencias, postulaciones y datos asociados al proceso de prácticas |

## Estructura del repositorio

```text
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

1. **Descarga el proyecto:** en GitHub pulsa **Code → Download ZIP** y descomprímelo, o utiliza Git:

   ```bash
   git clone https://github.com/OscarAcosta17/INF225-Grupo-3.git
   ```

2. **Abre una terminal** dentro de la carpeta `mi-proyecto-node-docker`, donde se encuentra `docker-compose.yml`.

3. **Levanta el sistema:**

   ```bash
   docker compose up --build
   ```

   La primera vez puede demorar unos minutos mientras se instalan las dependencias.

4. **Abre la aplicación** en el navegador: <http://localhost:3000>.

### Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | `estudiante@usm.cl` | `1234` |
| Empresa | `empresa@tech.com` | `1234` |

Estas cuentas corresponden a datos de prueba para el entorno de desarrollo. No deben utilizarse como credenciales de producción.

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

- **"Cannot connect to the Docker daemon"**: abre Docker Desktop y espera a que esté en ejecución.
- **"port is already allocated"**: otro programa utiliza el puerto 3000, 4000 o 5432. Libera el puerto y vuelve a intentar.
- **No avanza o hay errores inesperados**: asegúrate de estar dentro de la carpeta que contiene `docker-compose.yml` y revisa los logs.

## Aseguramiento de calidad (QA)

| Indicador | Iteración 1 | Iteración 2 |
|---|:---:|:---:|
| Casos verificados | 11 | 17 |
| Casos aprobados | 8/11 | 17/17 |
| Ambiente de pruebas | Local | Web desplegada |

Durante la primera iteración se registraron cinco defectos. En la segunda iteración se implementaron las siguientes correcciones:

| ID | Defecto | Estado al cierre |
|---|---|---|
| D-01 | Ofertas caducadas visibles en catálogo y filtros | ✅ Corregido |
| D-02 | Ausencia de opción para limpiar filtros | ✅ Corregido |
| D-03 | Posibilidad de postular a ofertas caducadas | ✅ Corregido |
| D-04 | Formulario vacío tras bloquear una postulación | ✅ Corregido |
| D-05 | Mínimo fijo de $60.000 en el filtro de remuneración | ⏳ Pendiente |

Los 17 casos aprobados de la segunda iteración corresponden a RS5.1, RS5.2, RS6, RS12, RS9.1 y RS9.2. El módulo RS7 permanece en fase beta.

Las correcciones de defectos corresponden al estado reportado en el código y no implican por sí solas una reverificación formal de todos ellos.

## Estado actual y próximos pasos

### Iteración 1 — Hito 4

- Gestión del perfil y competencias del estudiante.
- Publicación y edición de ofertas de práctica.
- Catálogo y filtros de búsqueda.
- Postulación centralizada.
- Verificación del correo institucional.

### Iteración 2 — Hito 5

- Seguimiento de postulaciones y notificaciones por correo.
- Caducidad automática de ofertas y postulaciones.
- Algoritmo de recomendación de ofertas.
- Configuración centralizada de plazos.
- Bitácora diaria y resumen de horas.
- Gestión del proceso de convalidación.
- Corrección de defectos identificados durante la primera iteración.

Al cierre del Hito 5 se reporta la implementación de todos los requisitos comprometidos, sin eliminación de requisitos del alcance acordado. El proceso de convalidación fue ampliado y se mantiene en fase beta.

### Pendientes y mejoras futuras

- Completar la validación del módulo de convalidación (RS7).
- Resolver el defecto D-05, definiendo una regla adecuada para el mínimo del filtro de remuneración.
- Evaluar las sugerencias de usabilidad relacionadas con horas semanales, localidad, duración, ofertas caducadas, teléfono y enlaces de LinkedIn/GitHub.
- Verificar el almacenamiento seguro de contraseñas mediante hashing antes de utilizar el sistema en producción.

Las funcionalidades de estadísticas, cierre por inactividad y verificación de identidad adicional (P-22, P-23 y P-26) quedaron fuera del alcance comprometido del MVP.

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
