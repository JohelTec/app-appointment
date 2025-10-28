import { Appointment } from "../entities/appointment.entity";

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findById(insuredId: string): Promise<Appointment | null>;
  updateStatus(insuredId: string, status: string): Promise<void>;
}
