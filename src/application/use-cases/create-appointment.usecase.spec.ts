import { CreateAppointmentUseCase } from "./create-appointment.usecase";
import { Appointment } from "../../domain/entities/appointment.entity";

describe("CreateAppointmentUseCase", () => {
  const mockRepository = {
    save: jest.fn(),
  };

  const mockPublisher = {
    publish: jest.fn(),
  };

  const useCase = new CreateAppointmentUseCase(
    mockRepository as any,
    mockPublisher as any
  );

  it("debería guardar y publicar una cita correctamente", async () => {
    const data = { insuredId: "123", countryISO: "PE", status: "PENDING" };
    const appointment = Appointment.fromJSON(data);

    mockRepository.save.mockResolvedValue(appointment);
    mockPublisher.publish.mockResolvedValue(true);

    const result = await useCase.execute(data);

    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Appointment));
    expect(mockPublisher.publish).toHaveBeenCalled();
    expect(result).toEqual(appointment);
  });
});
