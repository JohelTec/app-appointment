import { AppointmentRepository } from "../../domain/repositories/appointment.repository";

export class UpdateStatusUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(insuredId: string, status: string) {
    await this.repository.updateStatus(insuredId, status);
  }
}
