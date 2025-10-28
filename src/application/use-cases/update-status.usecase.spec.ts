import { UpdateStatusUseCase } from "./update-status.usecase";
import { Appointment } from "../../domain/entities/appointment.entity";
import { NotFoundError } from "../../shared/errors/not-found.error";

describe("UpdateStatusUseCase", () => {
  const mockRepository = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  const useCase = new UpdateStatusUseCase(mockRepository as any);

  beforeEach(() => jest.clearAllMocks());

  it("debería actualizar el estado correctamente", async () => {
    const existing = new Appointment("123", "PE", "PEDING");
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.updateStatus.mockResolvedValue(undefined); // no retorna nada

    await useCase.execute("123", "CONFIRMED");

    expect(mockRepository.findById).toHaveBeenCalledWith("123");
    expect(mockRepository.updateStatus).toHaveBeenCalledWith("123", "CONFIRMED");
  });

  it("debería lanzar NotFoundError si la cita no existe", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute("999", "CANCELLED")).rejects.toThrow(NotFoundError);
  });
});
