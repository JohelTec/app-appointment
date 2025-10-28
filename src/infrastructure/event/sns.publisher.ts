import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Appointment } from "../../domain/entities/appointment.entity";

const sns = new SNSClient({ region: process.env.AWS_REGION || "us-east-1" });

export class SNSPublisher {
  async publish(topicArn: string, appointment: Appointment): Promise<void> {
    await sns.send(new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(appointment),
      MessageAttributes: {
        countryISO: { DataType: "String", StringValue: appointment.countryISO },
      },
    }));
  }
}
