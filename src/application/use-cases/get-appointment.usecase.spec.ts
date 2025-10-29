import { GetAppointmentUseCase } from "./get-appointment.usecase";
import { NotFoundError } from "../../shared/errors/not-found.error";
import { Appointment } from "../../domain/entities/appointment.entity";

describe("GetAppointmentUseCase", () => {
  const mockRepository = {
    findById: jest.fn(),
  };

  const useCase = new GetAppointmentUseCase(mockRepository as any);

  it("The appointment should return when it exists", async () => {
    const appointment = new Appointment("123", "PE", "CONFIRMED");
    mockRepository.findById.mockResolvedValue(appointment);

    const result = await useCase.execute("123");

    expect(result).toEqual(appointment);
    expect(mockRepository.findById).toHaveBeenCalledWith("123");
  });

  it("It should throw NotFoundError if it doesn't exist", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute("999")).rejects.toThrow(NotFoundError);
  });
});
