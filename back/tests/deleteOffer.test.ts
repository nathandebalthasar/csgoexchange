import {describe, expect, test} from '@jest/globals';
import { handler as deleteOfferHandler } from '../src/lambda/deleteOffer';
import { mockClient } from "aws-sdk-client-mock";
import { BatchWriteCommand, DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe('Lambda deleteOffer parameters', () => {
  test('No offerId should return a 400 statusCode', async () => {
    const res = await deleteOfferHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '0123456789'
          }
        }
      },
      queryStringParameters: {
      }
    });
    expect(res.statusCode).toBe(400);
  });

  test('No steamid should return a 400 statusCode', async () => {
    const res = await deleteOfferHandler({
      requestContext: {
        authorizer: {
          lambda: {
          }
        }
      },
      queryStringParameters: {
        offerId: '0123456789',
      },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('Lambda deleteOffer ', () => {
  test('Empty offer response should return a 400 statusCode', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [],
    });
    const res = await deleteOfferHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '0123456789'
          }
        }
      },
      queryStringParameters: {
        offerId: '0123456789',
      },
    });
    expect(res.statusCode).toBe(500);
  });

  test('Error during batchWrite should return a 500 statusCode', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{
        PK: 'OFFERS#2',
        SK: '2023-03-13T13:54:54.126+00:00',
        'GSI1-PK': 'USER#012345567890123456',
        'GSI1-SK': 'OFFER#0a7443d0-01d9-40a5-9e18-cb6fc4e98b29',
        tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=160024312&token=AdfCk_ma',
      }],
    });
    ddbMock.on(BatchWriteCommand).rejects(new Error('Error during batchWrite'));
    const res = await deleteOfferHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '0123456789'
          }
        }
      },
      queryStringParameters: {
        offerId: '0123456789',
      },
    });
    expect(res.statusCode).toBe(500);
  });

  test('Success should return a 200 statusCode', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{
        PK: 'OFFERS#2',
        SK: '2023-03-13T13:54:54.126+00:00',
        'GSI1-PK': 'USER#012345567890123456',
        'GSI1-SK': 'OFFER#0a7443d0-01d9-40a5-9e18-cb6fc4e98b29',
        tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=160024312&token=AdfCk_ma',
      }],
    });
    ddbMock.on(BatchWriteCommand).resolves({
      UnprocessedItems: {},
    });

    const res = await deleteOfferHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '0123456789'
          }
        }
      },
      queryStringParameters: {
        offerId: '0123456789',
      },
    });
    expect(res.statusCode).toBe(200);
  });
});
