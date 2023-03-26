import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDB } from "../shared/DynamoDB";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

export const getItemsTypes = async () => {
  const client = new DynamoDB(process.env.DB_USERS!, new DynamoDBClient({}));

  const params: QueryCommandInput = {
    TableName: client.tableName,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: {
      ':PK': 'ITEMTYPE',
    },
  };

  try {
    const res = await client.query(params);
    const types = res.Items.map(item => item.SK.split('#')[1]);

    return {
      items: types,
    };
  } catch (e) {
    throw new Error(e);
  }
}

export const handler = async (event: any) => {
  try {
    const itemsTypes = await getItemsTypes();

    return {
      statusCode: 200,
      body: JSON.stringify(itemsTypes),
    };
  } catch (e) {
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }
}
