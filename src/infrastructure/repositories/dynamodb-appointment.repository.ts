import { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { Appointment } from "../../domain/entities/appointment.entity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const dynamo = DynamoDBDocumentClient.from(client);

export class DynamoDBAppointmentRepository implements AppointmentRepository {
  private readonly tableName: string;

  constructor(tableName?: string) {
    this.tableName = tableName || process.env.TABLE_NAME || "Appointment";
  }

  async save(appointment: Appointment): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: this.tableName, Item: appointment }));
  }

  async findById(insuredId: string): Promise<Appointment | null> {
    const result = await dynamo.send(new GetCommand({ TableName: this.tableName, Key: { insuredId } }));
    return (result.Item as Appointment) ?? null;
  }

  async updateStatus(insuredId: string, status: string): Promise<void> {
    await dynamo.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { insuredId },
        UpdateExpression: "set #s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": status },
      })
    );
  }
}
