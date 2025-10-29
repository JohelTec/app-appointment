import { MySQLAppointmentRepository } from "./mysql-appointment.repository";
import { Appointment } from "../../domain/entities/appointment.entity";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("MySQLAppointmentRepository", () => {
  let repository: MySQLAppointmentRepository;
  const mockConnection = { execute: jest.fn(), end: jest.fn() } as any;

  beforeEach(() => {
    repository = new MySQLAppointmentRepository();
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
    jest.clearAllMocks();
  });

  it("connect() debería crear la conexión", async () => {
    await repository.connect();
    expect(mysql.createConnection).toHaveBeenCalledTimes(1);
  });

  it("save() debería ejecutar query con valores correctos", async () => {
    await repository.connect();
    const appointment = new Appointment("123", "PE", "PENDING");
    await repository.save(appointment);

    expect(mockConnection.execute).toHaveBeenCalledTimes(1);
    const [query, values] = mockConnection.execute.mock.calls[0];
    expect(query).toContain("INSERT INTO appointments");
    expect(values[0]).toBe("123");
    expect(values[6]).toBe("PE");
  });

  it("save() sin conexión debería lanzar error", async () => {
    const appointment = new Appointment("123", "PE", "PENDING");
    await expect(repository.save(appointment)).rejects.toThrow("Database not connected");
  });

  it("close() debería cerrar la conexión", async () => {
    await repository.connect();
    await repository.close();
    expect(mockConnection.end).toHaveBeenCalledTimes(1);
  });
});
