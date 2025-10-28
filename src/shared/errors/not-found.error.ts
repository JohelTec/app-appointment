import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404, true);
  }
}
