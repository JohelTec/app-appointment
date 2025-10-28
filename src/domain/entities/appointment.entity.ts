export class Appointment {
  constructor(
    public insuredId: string,
    public countryISO: string,
    public status: string,
    public scheduleId?: string,
    public centerId?: string,
    public specialtyId?: string,
    public medicId?: string,
    public date?: string,
  ) {}

  static fromJSON(json: any): Appointment {
    return new Appointment(
      json.insuredId,
      json.countryISO,
      json.status,
      json.scheduleId,
      json.centerId,
      json.specialtyId,
      json.medicId,
      json.date,
    );
  }
}
