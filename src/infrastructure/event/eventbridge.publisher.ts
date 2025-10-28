import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const eb = new EventBridgeClient({ region: process.env.AWS_REGION || "us-east-1" });

export class EventBridgePublisher {
  async publish(detail: any): Promise<void> {
    await eb.send(new PutEventsCommand({
      Entries: [
        {
          Source: "appointment.processor",
          DetailType: "AppointmentProcessed",
          Detail: JSON.stringify(detail),
        },
      ],
    }));
  }
}
