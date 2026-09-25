# Cortador Pro — Web de reservas para cortador de jamón

Aplicación web full stack para que un cortador de jamón profesional gestione las reservas de sus eventos (bodas, comuniones, eventos de empresa...).

- **Cliente**: solicita el servicio desde un formulario público, sin registrarse, y ve el **precio desglosado en tiempo real** (servicio, jamón y desplazamiento) antes de enviar la reserva.
- **Cortador**: gestiona todo desde un **panel privado con login**: reservas, catálogo de jamones, tarifas y localidades a las que se desplaza, con la opción de ajustar el precio final de cada reserva dejando constancia del motivo.

Está pensada como **plantilla reutilizable**: el nombre del negocio, los textos, el contacto y la marca se configuran en un único archivo (`cortador-front/src/config/site.ts`) y los colores en `index.css`, sin tocar componentes.

## Stack tecnológico

**Backend** — `cortador-back/`
- Java 21 + Spring Boot (Spring Web MVC, Spring Data JPA, Bean Validation)
- Hibernate + PostgreSQL
- Spring Security + JWT (autenticación del panel)
- Maven

**Frontend** — `cortador-front/`
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion (animaciones)

**Testing y calidad**
- Backend: JUnit 5, Mockito y AssertJ para tests unitarios; `@SpringBootTest` con MockMvc y peticiones HTTP reales para tests de integración. Cobertura con JaCoCo.
- Frontend: Vitest + React Testing Library (tests de componentes simulando la interacción del usuario).
- Integración continua con GitHub Actions: en cada push y Pull Request se ejecutan los tests de ambos lados, se compila el frontend y se envía el análisis a SonarCloud ([`.github/workflows/sonarcloud.yml`](.github/workflows/sonarcloud.yml)).

## Funcionalidad

**Web pública**
- Página de presentación del cortador con galería de eventos.
- Formulario de reserva con validación en cliente y servidor.
- Selección de la localidad del evento: la del cortador (sin desplazamiento), una de su lista (se cobra por km) u otra localidad (precio "a consultar").
- Presupuesto en vivo, recalculado por el backend cada vez que cambia algún dato que afecta al precio.

**Panel del cortador**
- Login con JWT. Sin pantalla de registro: la cuenta de administrador se crea al arrancar a partir de variables de entorno.
- **Reservas**: listado por estado (pendiente, confirmada, completada, cancelada), cambio de estado y ajuste manual del precio con motivo obligatorio. El precio calculado se conserva junto al ajustado.
- **Jamones**: alta, edición y desactivación. Un jamón desactivado deja de ofrecerse, pero las reservas antiguas lo conservan.
- **Tarifas**: precio por hora, precio por km, localidad del cortador y lista de localidades con sus km.

**Reglas de negocio destacadas**
- El precio se calcula siempre en el backend, en una única clase (`PriceCalculator`), y el formulario muestra exactamente el precio que luego se guarda.
- Cada reserva guarda una copia del desglose: si el cortador cambia después sus tarifas, las reservas existentes no se alteran.
- Una reserva de servicio completo exige un jamón activo; una reserva cancelada o completada no puede cambiar de estado.
- Todos los errores de la API tienen el mismo formato JSON y sus mensajes están en español, listos para mostrarse al usuario.

## Arquitectura

**Backend**: arquitectura en capas.
- **Capas**: controladores → servicios (interfaz + implementación) → repositorios.
- **DTOs**: separan la API de las entidades JPA.
- **Errores**: un `@RestControllerAdvice` centraliza su gestión.
- **Precio**: la lógica está aislada en el paquete `pricing`.
  - `PriceCalculator`: solo cálculo, sin acceso a datos.
  - `QuoteService`: resuelve los datos y aplica las reglas.

**Frontend**: organizado por responsabilidades.
- **`api/`**: acceso al backend.
- **`auth/`**: sesión.
- **`hooks/`**: lógica reutilizable.
- **`components/`** y **`pages/`**: interfaz.

**Seguridad**
- **API sin estado**: se autentica con token JWT.
- **Endpoints públicos**: solo los que usa el formulario (crear reserva, presupuesto, catálogo y localidades) y el login.
- **Panel**: todo lo que cuelga de `/api/admin/**` exige rol de administrador.

## Estructura del repositorio

Monorepo con backend y frontend en carpetas independientes, cada una con su propio gestor de dependencias:

```
Cortador/
├── cortador-back/    # API REST (Spring Boot)
└── cortador-front/   # Interfaz web (React)
```

## Cómo ejecutarlo en local

**Requisitos**: JDK 21, Node.js 20.19 o superior y PostgreSQL.

**Base de datos**: crea una base de datos y un usuario para la aplicación. Por defecto se usan `cortador_db`, `cortador_user` y `cortador_dev_pw`; se pueden cambiar con variables de entorno. Hibernate crea las tablas al arrancar.

**Backend**

```bash
cd cortador-back
./mvnw spring-boot:run
```

Variables de entorno disponibles (todas tienen un valor por defecto para desarrollo local, ver `application.properties`):

| Variable | Para qué sirve |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Conexión a PostgreSQL |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Cuenta del cortador que se crea al arrancar |
| `JWT_SECRET`, `JWT_EXPIRATION_MS` | Firma y caducidad del token de sesión |
| `SAMPLE_DATA_ENABLED` | Crea un catálogo, tarifas y localidades de ejemplo la primera vez (`true` por defecto) |

**Frontend**

```bash
cd cortador-front
npm install
npm run dev
```

Necesita la variable `VITE_API_URL` apuntando al backend (ver `.env.example`).

## Tests

```bash
# Backend (los tests de integración necesitan la base de datos PostgreSQL)
cd cortador-back
./mvnw test

# Frontend
cd cortador-front
npm test
npm run test:coverage   # con informe de cobertura
```

## Estado del proyecto

En desarrollo. Próximos pasos:
- Calendario de disponibilidad por franjas (día / noche) en el formulario y en el panel.
- Disponibilidad del cortador (horario habitual y días bloqueados).
- Pre-reserva con verificación por email y confirmación tras el pago de la señal.
- Condiciones del servicio, política de privacidad y despliegue.
