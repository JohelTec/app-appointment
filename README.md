echo "# Appointment API Documentation

## Overview
The **Appointment API** provides endpoints to manage appointments. You can create new appointments and retrieve them by the insured ID.

### Base URL
The base URL for the API is:
\`\`\`
https://9d3t3hh0qj.execute-api.us-east-1.amazonaws.com/dev
\`\`\`

## Authentication
The API uses **API Key** for authentication. You must pass the API key in the \`x-api-key\` header for every request.

---

## Endpoints

### 1. **Get Appointment by Insured ID**

#### \`GET /appointments/{insuredId}\`

Retrieves an appointment by the insured person's ID.

##### Path Parameters:
- **insuredId** (required): The unique ID of the insured person.

##### Request Example:
\`\`\`bash
GET https://9d3t3hh0qj.execute-api.us-east-1.amazonaws.com/dev/appointments/12345
\`\`\`

##### Response Example (200 OK):
\`\`\`json
{
  "insuredId": "12345",
  "status": "pending",
  "createdAt": "2025-10-29T12:00:00Z"
}
\`\`\`

##### Response Codes:
- **200 OK**: Successful response, returns the appointment details.
- **404 Not Found**: Appointment not found for the provided \`insuredId\`.
- **500 Internal Server Error**: Something went wrong on the server.

---

### 2. **Create New Appointment**

#### \`POST /appointments\`

Creates a new appointment for an insured person.

##### Request Body Example:
\`\`\`json
{
  "insuredId": "12345",
  "status": "pending"
}
\`\`\`

##### Request Example:
\`\`\`bash
POST https://9d3t3hh0qj.execute-api.us-east-1.amazonaws.com/dev/appointments
Content-Type: application/json
x-api-key: YOUR_API_KEY

{
  "insuredId": "12345",
  "status": "pending"
}
\`\`\`

##### Response Example (201 Created):
\`\`\`json
{
  "insuredId": "12345",
  "status": "pending",
  "createdAt": "2025-10-29T12:00:00Z"
}
\`\`\`

##### Response Codes:
- **201 Created**: Appointment created successfully.
- **400 Bad Request**: Invalid input data (e.g., missing required fields).
- **500 Internal Server Error**: Something went wrong on the server.

---

## Error Handling

### Common Error Responses:
- **400 Bad Request**: The request is malformed or missing required data.
- **404 Not Found**: The requested resource could not be found.
- **500 Internal Server Error**: A server error occurred, please try again later.

---

## Example Requests Using cURL

### 1. Get appointment by insured ID:

\`\`\`bash
curl -X GET https://9d3t3hh0qj.execute-api.us-east-1.amazonaws.com/dev/appointments/12345 \
  -H "x-api-key: YOUR_API_KEY"
\`\`\`

### 2. Create an appointment:

\`\`\`bash
curl -X POST https://9d3t3hh0qj.execute-api.us-east-1.amazonaws.com/dev/appointments \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"insuredId": "12345", "status": "pending"}'
\`\`\`

---

## CORS Configuration

CORS has been enabled for this API to allow requests from any origin. The following headers are configured:

- \`Access-Control-Allow-Origin: *\`
- \`Access-Control-Allow-Methods: GET, POST, OPTIONS\`
- \`Access-Control-Allow-Headers: Content-Type, x-api-key\`

This ensures that the API can be accessed by clients from different origins without facing CORS issues.

---

## Components

### Schemas

#### **Appointment** Schema

This schema is used for representing an appointment.

\`\`\`json
{
  "insuredId": "string",
  "status": "string",  // Possible values: "pending", "completed"
  "createdAt": "string"  // ISO 8601 date-time format
}
\`\`\`

#### **AppointmentInput** Schema

This schema is used for creating a new appointment.

\`\`\`json
{
  "insuredId": "string",  // Required
  "status": "string"  // Default value: "pending"
}
\`\`\`

---

## Conclusion

The **Appointment API** allows for the creation and management of appointments for insured individuals. Ensure that you pass the correct **API Key** for all requests and follow the proper endpoint structure for retrieving or creating appointments.
" > README.md
