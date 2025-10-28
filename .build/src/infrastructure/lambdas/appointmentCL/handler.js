"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCL = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_sns_1 = require("@aws-sdk/client-sns");
const client = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }); // ajusta tu región
const dynamoDB = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const sns = new client_sns_1.SNSClient({ region: "us-east-1" });
const processCL = async (event) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.body);
        console.log("Processing CL appointment:", body);
        // Aquí guardarías en MySQL CL o invocarías otro servicio
    }
};
exports.processCL = processCL;
//# sourceMappingURL=handler.js.map