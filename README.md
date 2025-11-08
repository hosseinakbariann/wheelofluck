# 🎡 Wheel of Luck – Microservices System

A **microservices-based system** built with [NestJS](https://nestjs.com/) the project is a simple system for an online campaign for users to get score for their purchases
and use it to attend a lottery by the name of "wheelofluck".

---

## 🧩 Architecture Overview

This project is composed of **4 independent NestJS services**:

| Service | Description |
|----------|-------------|
| 🧭 **API Gateway** | Central entry point. Handles routing. |
| 👤 **User Service** | The User Microservice is responsible for authentication and user mangement it includes two main modules 'auth' and 'users'. |
| 🛍️ **Shopping Service** | The Shopping Microservice is responsible for managing goods and purchasing. It includes two main modules: 'goods' and 'purchases'. |
| 🎯 **Campaign Service** | The Campaign Microservice is responsible for managing prizes and spins. It includes two main modules: 'prizes' and 'spins'. |

All services communicate via **RabbitMQ** for asynchronous message passing and **Prisma** for database access.

---

## ⚙️ Tech Stack

- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **RabbitMQ**
- **JWT Authentication**
- **TypeScript**

---

## 🚀 Getting Started

### 1️⃣ Clone the repositories

Each service is a separate NestJS project.

```bash
git clone https://github.com/hosseinakbariann/wheelofluck.git

```

## 📘 API Documentation

You can explore the live API docs via Swagger UI:

🔗 [WheelOfLuck Swagger](https://github.com/hosseinakbariann/wheelofluck/blob/develop/api-gateway/WheelOfLuck.yaml)
🔗 [See Online Swagger](https://editor.swagger.io/?url=https://raw.githubusercontent.com/wheelofluck/main/docs/swagger.yml)
