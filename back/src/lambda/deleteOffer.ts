import { DynamoDB } from "../shared/DynamoDB";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommandInput, DeleteCommandInput, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const getOffer = async (client: DynamoDB, offerId: string, steamid: string) => {
  const params: QueryCommandInput = {
    TableName: client.tableName,
    IndexName: 'GSI1',
    KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': `USER#${steamid}`,
      ':SK': `OFFER#${offerId}`,
    },
    ExpressionAttributeNames: {
      '#PK': 'GSI1-PK',
      '#SK': 'GSI1-SK',
    },
  }
  const res = await client.query(params);
  if (res?.Items?.length === 0)
    throw new Error('Cannot get offer');
  return res?.Items[0];
}

const deleteOffer = async (client: DynamoDB, offerId: string, steamid: string) => {
  const offer = await getOffer(client, offerId, steamid);
  const params: BatchWriteCommandInput = {
    RequestItems: {
      [client.tableName]: [
        {
          DeleteRequest: {
            Key: {
              PK: offer.PK,
              SK: offer.SK,
            },
          },
        },
        {
          DeleteRequest: {
            Key: {
              PK: offer["GSI1-PK"],
              SK: offer["GSI1-SK"],
            },
          },
        },
      ],
    },
  };

  const res = await client.batchWrite(params);
  return res;
}

export const handler = async (event: any) => {
  const steamid = event?.requestContext?.authorizer?.lambda?.steamid!;
  const offerId = event?.queryStringParameters?.offerId!;

  if (!steamid || !offerId)
    return {
      statusCode: 400,
      message: 'Bad request',
    };
  const client = new DynamoDB(process.env.DB_USERS!, new DynamoDBClient({}));
  try {
    await deleteOffer(client, offerId, steamid);
    return {
      statusCode: 200,
      message: 'OK',
    };
  } catch (e) {
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }
}
