# Cortador Pro — Web de reservas para cortador de jamón

Aplicación web de gestión de reservas para un cortador de jamón profesional independiente. Los clientes solicitan el servicio para su evento (boda, comunión, evento de empresa...) a través de un formulario público, y el cortador gestiona esas solicitudes desde un panel de administración protegido con login.

Proyecto pensado como plantilla genérica y reutilizable: el nombre del negocio, los textos, colores y contacto se configuran en un único punto (`config/site.ts`), sin tocar componentes.

## Stack tecnológico

**Backend** — `cortador-back/`
- Java 21 + Spring Boot (Spring Web, Spring Data JPA)
- Hibernate + PostgreSQL
- Spring Security + JWT (autenticación del panel de administración)
- Maven

**Frontend** — `cortador-front/`
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animaciones)
- React Router

**Testing y calidad**
- Backend: JUnit 5 + Mockito + AssertJ, con cobertura medida por JaCoCo
- Frontend: Vitest + React Testing Library, con cobertura en formato lcov
- Análisis continuo de calidad de código con SonarCloud, ejecutado automáticamente en cada push/PR mediante GitHub Actions ([`.github/workflows/sonarcloud.yml`](.github/workflows/sonarcloud.yml))

## Funcionalidad

- Formulario público de reserva, sin necesidad de registro por parte del cliente
- Catálogo de tipos de jamón con precio, seleccionable en reservas de servicio completo
- Panel de administración (login JWT) para consultar reservas y cambiar su estado (pendiente, confirmada, cancelada, completada)
- Reglas de negocio validadas en el backend (p. ej. una reserva de servicio completo exige elegir un tipo de jamón; una reserva cancelada o completada no puede cambiar de estado)

## Estructura del repositorio

Monorepo con backend y frontend en carpetas independientes, cada una con su propio gestor de dependencias:

```
Cortador/
├── cortador-back/    # API REST (Spring Boot)
└── cortador-front/   # Interfaz web (React)
```

## Cómo ejecutarlo en local

**Backend**

```bash
cd cortador-back
./mvnw spring-boot:run
```

Necesita una base de datos PostgreSQL local (variables `DB_USERNAME` / `DB_PASSWORD` en `application.properties`).

**Frontend**

```bash
cd cortador-front
npm install
npm run dev
```

Necesita la variable `VITE_API_URL` apuntando al backend (ver `.env.example`).

## Tests

```bash
# Backend
cd cortador-back
./mvnw test

# Frontend
cd cortador-front
npm test
```
