import { appointment } from './handler';
import { DynamoDBAppointmentRepository } from '../../repositories/dynamodb-appointment.repository';
import { SNSPublisher } from '../../event/sns.publisher';
import { NotFoundError } from '../../../shared/errors/not-found.error';

jest.mock('../../repositories/dynamodb-appointment.repository');
jest.mock('../../event/sns.publisher');

describe('Appointment Handler', () => {
  let repoMock: jest.Mocked<DynamoDBAppointmentRepository>;
  let publisherMock: jest.Mocked<SNSPublisher>;

  beforeEach(() => {
    repoMock = new DynamoDBAppointmentRepository() as jest.Mocked<DynamoDBAppointmentRepository>;
    publisherMock = new SNSPublisher() as jest.Mocked<SNSPublisher>;

    repoMock.save.mockResolvedValue(undefined);
    repoMock.findById.mockImplementation(async (id: string) => {
      if (id === '123') return { insuredId: '123', countryISO: 'PE', status: 'PENDING' };
      throw new NotFoundError('Cita no encontrada');
    });
    repoMock.updateStatus.mockResolvedValue(undefined);
    publisherMock.publish.mockResolvedValue(undefined);

    // Inyectar mocks en el handler
    (appointment as any).__repo = repoMock;
    (appointment as any).__publisher = publisherMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST should create appointment', async () => {
    const event = {
      requestContext: { http: { method: 'POST' } },
      body: JSON.stringify({ insuredId: '123', countryISO: 'PE', status: 'PENDING' }),
    };

    const result = await appointment(event as any);

    expect(result.statusCode).toBe(201);
    expect(repoMock.save).toHaveBeenCalledTimes(1);
    expect(publisherMock.publish).toHaveBeenCalledTimes(1);
  });

  it('GET should return existing appointment', async () => {
    const event = {
      requestContext: { http: { method: 'GET' } },
      pathParameters: { insuredId: '123' },
    };

    const result = await appointment(event as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).insuredId).toBe('123');
  });

  it('GET not found should return 404', async () => {
    const event = {
      requestContext: { http: { method: 'GET' } },
      pathParameters: { insuredId: '999' },
    };

    const result = await appointment(event as any);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Cita no encontrada');
  });

  it('SQS should update status correctly', async () => {
    const event = {
      Records: [
        { body: JSON.stringify({ detail: { insuredId: '123', status: 'COMPLETED' } }) },
      ],
    };

    const result = await appointment(event as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe('Estado actualizado');
    expect(repoMock.updateStatus).toHaveBeenCalledWith('123', 'COMPLETED');
  });

  it('SQS with invalid body should not call update', async () => {
    const event = { Records: [{ body: '{}' }] };
    const result = await appointment(event as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe('Estado actualizado');
    expect(repoMock.updateStatus).not.toHaveBeenCalled();
  });
});
