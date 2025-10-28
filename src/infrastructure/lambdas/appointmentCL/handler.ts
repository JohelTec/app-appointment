
import { SQSEvent } from "aws-lambda";
import mysql from "mysql2/promise";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const eventBridge = new EventBridgeClient({ region: "us-east-1" });


export const appointmentCL = async (event: SQSEvent): Promise<void> => {
  const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  
    for (const record of event.Records) {
      try {
        const snsMessage = JSON.parse(record.body); // body viene de SQS
        const message = JSON.parse(snsMessage.Message); // contenido real del SNS
  
        console.log("📩 Processing CL appointment:", message);
  
        // Ejemplo: guardar datos en MySQL
        await connection.execute(
          "INSERT INTO appointments (insured_id, schedule_id, center_id, specialty_id, medic_id, appointment_date, country_iso) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            message.insuredId,
            message.scheduleId,
            message.centerId,
            message.specialtyId,
            message.medicId,
            new Date(message.date),
            message.countryISO
          ]
        );

        await eventBridge.send(
          new PutEventsCommand({
            Entries: [
              {
                Source: "appointment.processor",
                DetailType: "AppointmentProcessed",
                Detail: JSON.stringify({
                  countryISO: message.countryISO,
                  insuredId: message.insuredId,
                  status: "completed",
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          })
        );
  
      } catch (err) {
        console.error("❌ Error processing record:", err);
      }
    }
  
    await connection.end();
};
