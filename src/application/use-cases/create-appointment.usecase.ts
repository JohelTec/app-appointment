import { Appointment } from "../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { SNSPublisher } from "../../infrastructure/event/sns.publisher";

export class CreateAppointmentUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly publisher: SNSPublisher
  ) {}

  async execute(appointmentData: any) {
    const appointment = Appointment.fromJSON(appointmentData);
    await this.repository.save(appointment);
    await this.publisher.publish(process.env.TOPIC_ARN!, appointment);
    return appointment;
  }
}
