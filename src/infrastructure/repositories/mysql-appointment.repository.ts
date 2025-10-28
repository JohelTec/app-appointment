import mysql from "mysql2/promise";
import { Appointment } from "../../domain/entities/appointment.entity";

export class MySQLAppointmentRepository {
  private connection: mysql.Connection | null = null;

  async connect() {
    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  async save(appointment: Appointment): Promise<void> {
    if (!this.connection) throw new Error("Database not connected");

    await this.connection.execute(
      `INSERT INTO appointments (insured_id, schedule_id, center_id, specialty_id, medic_id, appointment_date, country_iso)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment.insuredId,
        appointment.scheduleId,
        appointment.centerId,
        appointment.specialtyId,
        appointment.medicId,
        appointment.date ? new Date(appointment.date) : new Date(),
        appointment.countryISO
      ]
    );
  }

  async close() {
    if (this.connection) await this.connection.end();
  }
}
