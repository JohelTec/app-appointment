"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAppointments = exports.getAppointment = exports.newAppointment = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_sns_1 = require("@aws-sdk/client-sns");
const client = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }); // ajusta tu región
const dynamoDB = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const sns = new client_sns_1.SNSClient({ region: "us-east-1" });
const newAppointment = async (event) => {
    try {
        const item = JSON.parse(event.body);
        const command = new lib_dynamodb_1.PutCommand({
            TableName: "Appointment",
            Item: item
        });
        await dynamoDB.send(command);
        // Publicar evento en SNS
        await sns.send(new client_sns_1.PublishCommand({
            TopicArn: process.env.TOPIC_ARN,
            Message: JSON.stringify(item),
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Cita guardada correctamente",
                data: item,
            }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error al guardar la cita",
                error: error.message,
            }),
        };
    }
};
exports.newAppointment = newAppointment;
const getAppointment = async (event) => {
    try {
        const id = event.pathParameters?.id;
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Falta el parámetro id" }),
            };
        }
        const command = new lib_dynamodb_1.GetCommand({
            TableName: "Appointment",
            Key: { insuredId: id }, // ajusta si tu key principal es otra
        });
        const { Item } = await dynamoDB.send(command);
        if (!Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Cita no encontrada" }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(Item),
        };
    }
    catch (error) {
        console.error("Error al obtener la cita:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error interno al obtener la cita",
                error: error.message,
            }),
        };
    }
};
exports.getAppointment = getAppointment;
const listAppointments = async () => {
    try {
        const command = new lib_dynamodb_1.ScanCommand({ TableName: "Appointment" });
        const { Items } = await dynamoDB.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(Items),
        };
    }
    catch (error) {
        console.error("Error al listar citas:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error interno al listar citas",
                error: error.message,
            }),
        };
    }
};
exports.listAppointments = listAppointments;
//# sourceMappingURL=handler.js.map