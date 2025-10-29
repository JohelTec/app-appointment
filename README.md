# Appointment API

## Descripción
La **Appointment API** es un servicio RESTful diseñado para gestionar las citas de personas aseguradas. Esta API permite crear, recuperar y administrar citas a través de identificadores únicos (ID) de asegurados.

## Tabla de Contenidos
- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Endpoints](#endpoints)
  - [1. Obtener cita por ID de asegurado](#1-obtener-cita-por-id-de-asegurado)
  - [2. Crear nueva cita](#2-crear-nueva-cita)
- [Manejo de Errores](#manejo-de-errores)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Características

- Crear nuevas citas.
- Consultar citas existentes por el ID del asegurado.
- Soporte para autenticación mediante **API Key**.
- Configuración **CORS** habilitada para permitir el acceso desde cualquier origen.

---

## Tecnologías

Este proyecto está construido usando las siguientes tecnologías:

- **Node.js 18.x**
- **AWS Lambda**
- **AWS API Gateway**
- **AWS SNS (Simple Notification Service)**
- **AWS SQS (Simple Queue Service)**
- **DynamoDB**
- **Serverless Framework**

---

## Requisitos

- Node.js 18.x o superior.
- **Serverless Framework** instalado:
  ```bash
  npm install -g serverless
