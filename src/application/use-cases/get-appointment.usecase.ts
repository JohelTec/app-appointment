import { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class GetAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(insuredId: string) {
    const appointment = await this.repository.findById(insuredId);
    if (!appointment) throw new NotFoundError("Cita no encontrada");
    return appointment;
  }
}
