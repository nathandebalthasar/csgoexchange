import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.REGION });
const documentClient = DynamoDBDocumentClient.from(client);

export const getUser = async (steamid: string): Promise<any> => {
  const command = new GetCommand({
    TableName: process.env.DB_USERS,
    Key: {
      PK: `USER#${steamid}`,
      SK: `USER#${steamid}`,
    }
  });

  try {
    const request = await documentClient.send(command);
    const requestSteamid = request?.Item?.steamid!;
    if (!requestSteamid)
      return null;

    const statusCode = request?.$metadata?.httpStatusCode;
    if (statusCode !== 200)
      throw new Error(`Unable to get user, statusCode: ${statusCode}`);
    if (steamid !== requestSteamid)
      throw new Error('SteamID differs from database')

    return request?.Item;
  } catch (e) {
    throw new Error('Unable to reach DynamoDB');
  }
}

export const registerUser = async (steamid: string) => {
  const command = new PutCommand({
    TableName: process.env.DB_USERS,
    Item: {
      PK: `USER#${steamid}`,
      SK: `USER#${steamid}`,
      'GSI1-PK': 'USER',
      'GSI1-SK': `USER#${steamid}`,
      steamid,
    },
  });

  try {
    await documentClient.send(command);
  } catch (e) {
    throw new Error('Unable to register user');
  }
}
