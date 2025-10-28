
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand,  } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({ region: "us-east-1" }); // ajusta tu región
const dynamoDB = DynamoDBDocumentClient.from(client);
const sns = new SNSClient({ region: "us-east-1" });


interface Appointment {
  insuredId: string;
  countryISO: string;
  status: string;
  [key: string]: any; // for other potential fields
}

interface SQSRecord {
  body: string;
  eventSource: string;
}

interface SQSEvent {
  Records: SQSRecord[];
}

interface EventDetail {
  insuredId: string;
  status: string;
}

export const appointment: APIGatewayProxyHandler = async (event: any) => {
  if (event.requestContext?.http?.method) {
    if (event.requestContext.http.method === "POST") {
      try {
        const item: Appointment = JSON.parse(event.body);
        const command = new PutCommand({
          TableName: "Appointment",
          Item: item
        });

        await dynamoDB.send(command);

        await sns.send(
          new PublishCommand({
            TopicArn: process.env.TOPIC_ARN!,
            Message: JSON.stringify(item),
            MessageAttributes: {
              countryISO: { DataType: "String", StringValue: item.countryISO }
            }
          })
        );

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Cita guardada correctamente",
            data: item,
          }),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Error al guardar la cita",
            error: (error as Error).message,
          }),
        };
      }
    }

    if (event.requestContext.http.method === "GET" && event.pathParameters?.insuredId) {
      try {
        const id: string = event.pathParameters.insuredId;

        const command = new GetCommand({
          TableName: "Appointment",
          Key: { insuredId: id },
        });

        const { Item } = await dynamoDB.send(command);

        if (!Item) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Cita no encontrada" }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(Item),
        };
      } catch (error) {
        console.error("Error al obtener la cita:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Error interno al obtener la cita",
            error: (error as Error).message,
          }),
        };
      }
    }
  }

  if (event.Records?.[0]?.eventSource === 'aws:sqs' && Array.isArray(event.Records)) {
    for (const record of event.Records as SQSRecord[]) {
      try {
        let body: any = record.body;
        if (typeof body === "string") {
          try {
            body = JSON.parse(body);
          } catch {
            console.warn("⚠️ No se pudo parsear body, usando valor original:", body);
          }
        }

        const { insuredId, status } = (body.detail ?? {}) as EventDetail;
        const params = {
          TableName: process.env.TABLE_NAME || "Appointment",
          Key: { insuredId },
          UpdateExpression: "set #s = :status",
          ExpressionAttributeNames: { "#s": "status" },
          ExpressionAttributeValues: { ":status": status },
          ReturnValues: "UPDATED_NEW" as const,
        };
        
        const result = await dynamoDB.send(new UpdateCommand(params));
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Estado actualizado correctamente",
            updated: result.Attributes,
          }),
        };
      } catch (err) {
        console.error("❌ Error al actualizar DynamoDB:", err);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: "Error interno al actualizar la cita" }),
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: "Método no soportado" }),
  };
};

