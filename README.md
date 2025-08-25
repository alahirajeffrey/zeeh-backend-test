## Zeeh Backend Engineer Test

Backend task to build a mini credit insight service that

- Ingests a bank statement (CSV).
- Computes income & spending insights.
- Integrates with a mock credit bureau API.

### Tech stack used

- Typescript
- Node
- NestJS
- Prisma
- MySQL
- Docker compose

### How to setup

- clone repo by running the command `git clone https://github.com/alahirajeffrey/zeeh-backend-test.git`
- navigate to cloned repo in your terminal i.e. `cd zeeh-backend-test.git`
- create a .env file using the .env.example file as a sample
- run the command `docker-compose up --build -d` to setup docker compose
- run the command `docker ps` to verify the containers are running
- visit `http://localhost:3000/api/v1/doc` to visit the swagger doc
- visit `localhost:3000/api/v1/statements/upload` to upload statements
- visit `http://localhost:3000/api/v1/metrics` to view system metrics

### Example CSV format

```
date,description,amount,balance
2025-08-01,Salary,10000,10000
2025-08-06,Groceries,2000,8000
2025-08-01,Salary,10000,18000
2025-04-16,Rent,15000,3000
2025-06-18,Netflix,1000,2000
2025-08-04,Electricity,1000,1000
2025-06-10,Coffee,200,800
2025-08-04,Transportation,500,300
2025-06-01,Salary,10000,10300
```

### Architecture

- **Modular Monolith**
  - the application is a single NestJS service organized into modules (e.g., `statement`, `insights`, `health`, etc.).
  - each module encapsulates its own logic (controllers, services, repositories).
  - prisma ORM provides database access and manages schema migrations.
  - observability is built in with Prometheus metrics (`/metrics`) and Terminus health checks (`/health`).

- **Data Flow**
  1. user uploads a **bank statement (CSV)**.
  2. `StatementModule` parses and stores statements + transactions in MySQL.
  3. `InsightsModule` computes **income, spending, and risk insights**.
  4. application integrates with a **mock credit bureau API** for enrichment.
  5. results are exposed via REST endpoints (documented in Swagger).

- **Deployment**
  - runs in Docker with Docker Compose.
  - services: `app` (NestJS backend) + `mysql` (database).
  - optional monitoring and observability stack: Prometheus, Grafana, Node-exporter.
