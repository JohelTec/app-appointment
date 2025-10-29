import { mockClient } from "aws-sdk-client-mock";
import { SNSClient, PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import { SNSPublisher } from "./sns.publisher";
import { Appointment } from "../../domain/entities/appointment.entity";

describe("SNSPublisher", () => {
  const snsMock = mockClient(SNSClient);
  let publisher: SNSPublisher;

  beforeEach(() => {
    snsMock.reset();
    publisher = new SNSPublisher();
  });

  it("You should send a message correctly", async () => {
    const appointment = new Appointment("123", "PE", "PENDING");

    snsMock.on(PublishCommand).resolves({ MessageId: "msg-123" });

    await expect(
      publisher.publish("arn:aws:sns:region:123:Topic", appointment)
    ).resolves.toBeUndefined();

    // Verificar que PublishCommand fue llamado exactamente 1 vez
    expect(snsMock.commandCalls(PublishCommand).length).toBe(1);

    // Validación segura del input
    const call = snsMock.commandCalls(PublishCommand)[0].args[0].input as PublishCommandInput;

    expect(call.TopicArn).toBe("arn:aws:sns:region:123:Topic");
    expect(JSON.parse(call.Message!)).toEqual(appointment);
    expect(call.MessageAttributes?.countryISO?.StringValue).toBe("PE");
  });

  it("It should throw an error if SNS fails", async () => {
    const appointment = new Appointment("456", "CL", "CONFIRMED");

    snsMock.on(PublishCommand).rejects(new Error("AWS SNS error"));

    await expect(
      publisher.publish("arn:aws:sns:region:123:Topic", appointment)
    ).rejects.toThrow("AWS SNS error");

    // Verificar que intentó enviar exactamente 1 vez
    expect(snsMock.commandCalls(PublishCommand).length).toBe(1);
  });
});
