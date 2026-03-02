/**
 * DynamoDB Document Client
 * Uses DynamoDBDocumentClient for easy JS-object marshalling/unmarshalling.
 * Credentials and region are loaded from environment variables.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// DynamoDBDocumentClient auto-marshals JS objects ↔ DynamoDB AttributeValue
export const dynamoDb = DynamoDBDocumentClient.from(client);
