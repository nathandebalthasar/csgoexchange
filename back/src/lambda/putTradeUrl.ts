import { DynamoDBDocumentClient, QueryCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDB } from "../shared/DynamoDB";
import { Offer } from "../utils/interfaces";

const updateTradeUrl = async (client: DynamoDB, steamid: string, tradeUrl: string) => {
  const params = {
    TableName: process.env.DB_USERS,
    Key: {
      PK: `USER#${steamid}`,
      SK: `USER#${steamid}`,
    },
    UpdateExpression: 'SET tradeUrl = :tradeUrl',
    ExpressionAttributeValues: {
      ':tradeUrl': tradeUrl,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await client.update(params);
  return res;
}

const getUserOffers = async (client: DynamoDB, steamid: string) => {
  const params: QueryCommandInput = {
    TableName: client.tableName,
    IndexName: 'GSI1',
    KeyConditionExpression: '#PK = :PK and begins_with(#SK, :SK)',
    ExpressionAttributeNames: {
      '#PK': 'GSI1-PK',
      '#SK': 'GSI1-SK',
    },
    ExpressionAttributeValues: {
      ':PK': `USER#${steamid}`,
      ':SK': 'OFFER#',
    },
  };

  const res = await client.query(params);
  return res?.Items!;
}

const updateCurrentOffers = async (client: DynamoDB, steamid: string, tradeUrl: string) => {
  const offers = await getUserOffers(client, steamid);
  if (!offers)
    return;

  await Promise.all(offers.map(async (offer: Offer) => {
    const params: UpdateCommandInput = {
      TableName: client.tableName,
      Key: {
        PK: offer.PK,
        SK: offer.SK,
      },
      UpdateExpression: 'SET tradeUrl = :tradeUrl',
      ExpressionAttributeValues: {
        ':tradeUrl': tradeUrl,
      },
      ReturnValues: 'ALL_NEW',
    };

    await client.update(params);
  }));
}

export const handler = async (event: any) => {
  try {
    const steamid = event?.requestContext?.authorizer?.lambda?.steamid!;
    const tradeUrl = JSON.parse(event?.body)?.tradeUrl!;
    if (!steamid || !tradeUrl)
      return {
        statusCode: 400,
        message: 'Bad request',
      };
    const client = new DynamoDB(process.env.DB_USERS!, new DynamoDBClient({ region: process.env.REGION }));

    await updateTradeUrl(client, steamid, tradeUrl);
    await updateCurrentOffers(client, steamid, tradeUrl);
    return {
      statusCode: 200,
      message: 'OK',
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }
}
