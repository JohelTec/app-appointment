import mysql from "mysql2/promise";
import { Appointment } from "../../domain/entities/appointment.entity";

export class MySQLAppointmentRepository {
  private connection: mysql.Connection | null = null;

  constructor(private config?: Partial<mysql.ConnectionOptions>) {}

  async connect() {
    if (this.connection) return;

    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ...this.config, // permite pasar configuración para tests
    });
  }

  async save(appointment: Appointment): Promise<void> {
    if (!this.connection) throw new Error("Database not connected");

    const query = `
      INSERT INTO appointments 
      (insured_id, schedule_id, center_id, specialty_id, medic_id, appointment_date, country_iso)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      appointment.insuredId,
      appointment.scheduleId ?? null,
      appointment.centerId ?? null,
      appointment.specialtyId ?? null,
      appointment.medicId ?? null,
      appointment.date ? new Date(appointment.date) : new Date(),
      appointment.countryISO,
    ];

    await this.connection.execute(query, values);
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}
