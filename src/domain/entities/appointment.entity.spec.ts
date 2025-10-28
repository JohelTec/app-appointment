import { Appointment } from "./appointment.entity";

describe("Appointment Entity", () => {
  it("debería crear una instancia correctamente", () => {
    const appointment = new Appointment("123", "PE", "PENDING");

    expect(appointment.insuredId).toBe("123");
    expect(appointment.countryISO).toBe("PE");
    expect(appointment.status).toBe("PENDING");
    expect(appointment.date).toBeUndefined();
  });

  it("debería crear una instancia desde JSON", () => {
    const json = {
      insuredId: "456",
      countryISO: "US",
      status: "CONFIRMED",
      date: "2025-10-28",
    };

    const appointment = Appointment.fromJSON(json);

    expect(appointment).toBeInstanceOf(Appointment);
    expect(appointment.insuredId).toBe("456");
    expect(appointment.date).toBe("2025-10-28");
  });
});
