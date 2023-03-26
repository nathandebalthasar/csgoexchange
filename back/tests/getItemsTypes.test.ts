import {describe, expect, test} from '@jest/globals';
import {handler as getItemsTypesHandler} from '../src/lambda/getItemsTypes';
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBDocumentClient, QueryCommand} from "@aws-sdk/lib-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe('Lambda getItemsTypes', () => {
  test('Error in query should return 500', async () => {
    ddbMock.on(QueryCommand).rejects('Error');
    const res = await getItemsTypesHandler({});
    expect(res.statusCode).toBe(500);
  });
  test('No error should return the item types', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'ITEMTYPE',
          SK: 'ITEMTYPE#TYPE1',
        },
        {
          PK: 'ITEMTYPE',
          SK: 'ITEMTYPE#TYPE2',
        },
      ],
    });

    const res = await getItemsTypesHandler({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(JSON.stringify({ items: ['TYPE1', 'TYPE2'] }));
  });
});
