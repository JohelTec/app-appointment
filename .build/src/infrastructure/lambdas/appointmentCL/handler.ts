
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({ region: "us-east-1" }); // ajusta tu región
const dynamoDB = DynamoDBDocumentClient.from(client);
const sns = new SNSClient({ region: "us-east-1" });

export const processCL = async (event: any) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    console.log("Processing CL appointment:", body);
    // Aquí guardarías en MySQL CL o invocarías otro servicio
  }
};
