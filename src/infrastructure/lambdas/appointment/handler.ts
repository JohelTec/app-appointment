
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand,  } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({ region: "us-east-1" }); // ajusta tu región
const dynamoDB = DynamoDBDocumentClient.from(client);
const sns = new SNSClient({ region: "us-east-1" });


export const newAppointment: any = async (event: any) => {
  if (event.requestContext && event.requestContext.http && event.requestContext.http.method) {
    try {
      const item = JSON.parse(event.body);
      const command = new PutCommand({
        TableName: "Appointment",
        Item: item
      });

      await dynamoDB.send(command)

      // Publicar evento en SNS
      await sns.send(
        new PublishCommand({
          TopicArn: process.env.TOPIC_ARN!,
          Message: JSON.stringify(item),
          MessageAttributes: {
            countryISO: { DataType: "String", StringValue: item.countryISO }
          }
        }),
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

  if (event.Records && event.Records[0].eventSource === 'aws:sqs' && Array.isArray(event.Records)) {
    for (const record of event.Records) {
      try {
        let body = record.body;
        if (typeof body === "string") {
          try {
            body = JSON.parse(body);
          } catch {
            console.warn("⚠️ No se pudo parsear body, usando valor original:", body);
          }
        }

        const { insuredId, status } = body.detail ?? null;
        const params = {
          TableName: process.env.TABLE_NAME || "Appointment",
          Key: { insuredId },
          UpdateExpression: "set #s = :status",
          ExpressionAttributeNames: { "#s": "status" },
          ExpressionAttributeValues: { ":status": status },
          ReturnValues: "UPDATED_NEW" as const, // 👈 Forzamos el tipo literal correcto
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
};

export const getAppointment: APIGatewayProxyHandler = async (event: any) => {
  try {
     const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Falta el parámetro id" }),
      };
    }

    const command = new GetCommand({
      TableName: "Appointment",
      Key: { insuredId: id }, // ajusta si tu key principal es otra
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
};

export const listAppointments: APIGatewayProxyHandler = async () => {
  try {
    const command = new ScanCommand({ TableName: "Appointment" });
    const { Items } = await dynamoDB.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(Items),
    };
  } catch (error) {
    console.error("Error al listar citas:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno al listar citas",
        error: (error as Error).message,
      }),
    };
  }
};

