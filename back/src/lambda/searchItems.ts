import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDB } from "../shared/DynamoDB";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const getItems = async (type: string) => {
  const client = new DynamoDB(process.env.DB_USERS!, new DynamoDBClient({}));

  const params: QueryCommandInput = {
    TableName: client.tableName,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: {
      ':PK': `ITEM#${type}`,
    },
  };

  try {
    const res = await client.query(params);

    return res?.Items?.reduce((acc: any, item: any) => [...acc, { painting: item.SK, url: item.url }], []);
  } catch (e) {
    throw new Error(e);
  }
}

export const handler = async (event: any) => {
  const weaponType = event?.queryStringParameters?.weaponType!;

  if (!weaponType)
    return {
      statusCode: 400,
      message: 'Bad request',
    };

  try {
    const items = await getItems(weaponType);

    return {
      statusCode: 200,
      body: JSON.stringify({ items }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }
}
