import { appointmentPE } from './handler';
import { MySQLAppointmentRepository } from '../../repositories/mysql-appointment.repository';
import { EventBridgePublisher } from '../../event/eventbridge.publisher';
import { Appointment } from '../../../domain/entities/appointment.entity';

jest.mock('../../repositories/mysql-appointment.repository');
jest.mock('../../event/eventbridge.publisher');
jest.mock('../../../domain/entities/appointment.entity');

describe('appointmentPE Lambda', () => {
  let repoMock: any;
  let publisherMock: any;

  beforeEach(() => {
    repoMock = {
      connect: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    publisherMock = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    (MySQLAppointmentRepository as jest.Mock).mockImplementation(() => repoMock);
    (EventBridgePublisher as jest.Mock).mockImplementation(() => publisherMock);
    (Appointment.fromJSON as jest.Mock).mockImplementation((obj) => obj);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save appointments and publish events', async () => {
    const message = { insuredId: '123', countryISO: 'PE' };
    const event = {
      Records: [
        { body: JSON.stringify({ Message: JSON.stringify(message) }) }
      ]
    };

    await appointmentPE(event as any);

    expect(repoMock.connect).toHaveBeenCalledTimes(1);
    expect(repoMock.save).toHaveBeenCalledTimes(1);
    expect(repoMock.save).toHaveBeenCalledWith(message);
    expect(publisherMock.publish).toHaveBeenCalledTimes(1);
    expect(repoMock.close).toHaveBeenCalledTimes(1);
  });
});