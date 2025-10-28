import { SQSEvent } from "aws-lambda";
import { MySQLAppointmentRepository } from "../../repositories/mysql-appointment.repository";
import { EventBridgePublisher } from "../../event/eventbridge.publisher";
import { Appointment } from "../../../domain/entities/appointment.entity";

export const appointmentPE = async (event: SQSEvent): Promise<void> => {
  const repo = new MySQLAppointmentRepository();
  const publisher = new EventBridgePublisher();

  await repo.connect();

  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.body);
    const message = JSON.parse(snsMessage.Message);
    const appointment = Appointment.fromJSON(message);

    await repo.save(appointment);
    await publisher.publish({
      countryISO: appointment.countryISO,
      insuredId: appointment.insuredId,
      status: "completed",
      timestamp: new Date().toISOString(),
    });
  }

  await repo.close();
};
