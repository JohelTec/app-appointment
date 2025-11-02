import { SQSEvent } from "aws-lambda";
import { MySQLAppointmentRepository } from "../../repositories/mysql-appointment.repository";
import { EventBridgePublisher } from "../../event/eventbridge.publisher";
import { Appointment } from "../../../domain/entities/appointment.entity";

export const appointmentCL = async (event: SQSEvent): Promise<void> => {
  const repository = new MySQLAppointmentRepository();
  const publisher = new EventBridgePublisher();

  await repository.connect();

  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.body);
    const message = JSON.parse(snsMessage.Message);
    const appointment = Appointment.fromJSON(message);

    await repository.save(appointment);
    await publisher.publish({
      countryISO: appointment.countryISO,
      insuredId: appointment.insuredId,
      status: "completed",
      timestamp: new Date().toISOString(),
    });
  }

  await repository.close();
};
