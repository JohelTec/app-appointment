import { mockClient } from "aws-sdk-client-mock";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { EventBridgePublisher } from "./eventbridge.publisher";

describe("EventBridgePublisher", () => {
  const ebMock = mockClient(EventBridgeClient);
  let publisher: EventBridgePublisher;

  beforeEach(() => {
    ebMock.reset(); // limpiar mocks antes de cada test
    publisher = new EventBridgePublisher();
  });

  it("It should send an event correctly", async () => {
    const detail = { insuredId: "123", status: "COMPLETED", countryISO: "PE" };

    ebMock.on(PutEventsCommand).resolves({
        FailedEntryCount: 0,
        Entries: [{ EventId: "evt-123" }],
    });

    await expect(publisher.publish(detail)).resolves.toBeUndefined();

    // Forzar al compilador que el primer call existe
    const callInput = ebMock.commandCalls(PutEventsCommand)[0]?.args[0]?.input;

    // Validación segura
    expect(callInput).toBeDefined();
    expect(callInput!.Entries![0].Source).toBe("appointment.processor");
    expect(callInput!.Entries![0].DetailType).toBe("AppointmentProcessed");
    expect(JSON.parse(callInput!.Entries![0].Detail!)).toEqual(detail);
  });

  it("It should throw an error if EventBridge fails", async () => {
    const detail = { insuredId: "456", status: "PENDING", countryISO: "CL" };

    ebMock.on(PutEventsCommand).rejects(new Error("AWS error"));

    await expect(publisher.publish(detail)).rejects.toThrow("AWS error");
  });
});
