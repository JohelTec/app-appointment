
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({ region: "us-east-1" }); // ajusta tu región
const dynamoDB = DynamoDBDocumentClient.from(client);
const sns = new SNSClient({ region: "us-east-1" });

export const newAppointment: APIGatewayProxyHandler = async (event: any) => {
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

