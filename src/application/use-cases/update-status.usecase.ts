import { Appointment } from "../../domain/entities/appointment.entity";
import { NotFoundError } from "../../shared/errors/not-found.error";
import { AppointmentRepository } from "../../domain/repositories/appointment.repository";

export class UpdateStatusUseCase {
  constructor(private repository: AppointmentRepository) {}

  async execute(insuredId: string, newStatus: string): Promise<Appointment> {
    // 1️⃣ Verificar si existe
    const existing = await this.repository.findById(insuredId);

    if (!existing) {
      throw new NotFoundError(`No se encontró la cita con ID ${insuredId}`);
    }

    // 2️⃣ Actualizar estado en la entidad
    existing.status = newStatus;

    // 3️⃣ Guardar en el repositorio
    await this.repository.updateStatus(insuredId, newStatus);

    // 4️⃣ Retornar la cita actualizada
    return existing;
  }
}
