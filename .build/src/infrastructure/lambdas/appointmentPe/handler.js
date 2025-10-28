"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPE = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const processPE = async (event) => {
    const connection = await promise_1.default.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    for (const record of event.Records) {
        try {
            const snsMessage = JSON.parse(record.body); // body viene de SQS
            const message = JSON.parse(snsMessage.Message); // contenido real del SNS
            console.log("📩 Processing PE appointment:", message);
            // Ejemplo: guardar datos en MySQL
            await connection.execute("INSERT INTO appointments (insured_id, schedule_id, center_id, specialty_id, medic_id, appointment_date, country_iso) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                message.insuredId,
                message.scheduleId,
                message.centerId,
                message.specialtyId,
                message.medicId,
                new Date(message.date),
                message.countryISO
            ]);
        }
        catch (err) {
            console.error("❌ Error processing record:", err);
        }
    }
    await connection.end();
};
exports.processPE = processPE;
//# sourceMappingURL=handler.js.map