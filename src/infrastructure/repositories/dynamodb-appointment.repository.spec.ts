import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAppointmentRepository } from "./dynamodb-appointment.repository";
import { Appointment } from "../../domain/entities/appointment.entity";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("DynamoDBAppointmentRepository", () => {
  let repository: DynamoDBAppointmentRepository;

  beforeEach(() => {
    ddbMock.reset();
    repository = new DynamoDBAppointmentRepository("AppointmentTest");
  });

  it("save() debería insertar un appointment", async () => {
    const appointment = new Appointment("123", "PE", "PENDING");

    ddbMock.on(PutCommand).resolves({});

    await expect(repository.save(appointment)).resolves.toBeUndefined();
    expect(ddbMock.commandCalls(PutCommand).length).toBe(1);
  });

  it("findById() debería devolver appointment existente", async () => {
    const appointment = new Appointment("123", "PE", "PENDING");
    ddbMock.on(GetCommand).resolves({ Item: appointment });

    const result = await repository.findById("123");
    expect(result).toEqual(appointment);
  });

  it("findById() debería devolver null si no existe", async () => {
    ddbMock.on(GetCommand).resolves({ Item: undefined });

    const result = await repository.findById("999");
    expect(result).toBeNull();
  });

  it("updateStatus() debería actualizar el estado", async () => {
    ddbMock.on(UpdateCommand).resolves({});

    await expect(repository.updateStatus("123", "COMPLETED")).resolves.toBeUndefined();
    expect(ddbMock.commandCalls(UpdateCommand).length).toBe(1);
  });
});
