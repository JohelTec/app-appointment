import { APIGatewayProxyHandlerV2, SQSEvent } from "aws-lambda";
import { DynamoDBAppointmentRepository } from "../../repositories/dynamodb-appointment.repository";
import { SNSPublisher } from "../../event/sns.publisher";
import { CreateAppointmentUseCase } from "../../../application/use-cases/create-appointment.usecase";
import { GetAppointmentUseCase } from "../../../application/use-cases/get-appointment.usecase";
import { UpdateStatusUseCase } from "../../../application/use-cases/update-status.usecase";
import { NotFoundError } from "../../../shared/errors/not-found.error";

const repository = new DynamoDBAppointmentRepository();
const publisher = new SNSPublisher();

const createUC = new CreateAppointmentUseCase(repository, publisher);
const getUC = new GetAppointmentUseCase(repository);
const updateUC = new UpdateStatusUseCase(repository);

export const appointment: APIGatewayProxyHandlerV2 | any = async (event: any) => {
  try {
    // SQS event
    if (event.Records) {
      const sqsEvent = event as SQSEvent;
      for (const record of sqsEvent.Records) {
        const body = JSON.parse(record.body);
        const { insuredId, status } = body.detail ?? {};
        if (insuredId && status) {
          await updateUC.execute(insuredId, status);
        }
      }
      return { statusCode: 200, body: JSON.stringify({ message: "Estado actualizado" }) };
    }

    // HTTP API (v2)
    const method = event.requestContext?.http?.method;
    const pathParams = event.pathParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    switch (method) {
      case "POST": {
        const result = await createUC.execute(body);
        return { statusCode: 201, body: JSON.stringify({ message: "Agendamiento en proceso" }) };
      }

      case "GET": {
        const { insuredId } = pathParams;
        if (!insuredId) {
          return { statusCode: 400, body: JSON.stringify({ message: "Falta insuredId en path" }) };
        }
        const result = await getUC.execute(insuredId);
        return { statusCode: 200, body: JSON.stringify(result) };
      }

      default:
        return { statusCode: 400, body: JSON.stringify({ message: `Método no soportado: ${method}` }) };
    }
  } catch (err: any) {
    console.error("Error en appointment handler:", err);

    if (err instanceof NotFoundError) {
      return { statusCode: err.statusCode || 404, body: JSON.stringify({ message: err.message }) };
    }

    // Si usas AppError, podrías devolver su statusCode:
    if (err?.statusCode && typeof err.statusCode === "number") {
      return { statusCode: err.statusCode, body: JSON.stringify({ message: err.message }) };
    }

    return { statusCode: 500, body: JSON.stringify({ message: "Error interno del servidor" }) };
  }
};
