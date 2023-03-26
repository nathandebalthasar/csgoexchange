import {describe, expect, test} from '@jest/globals';
import {handler as getOffersHandler} from '../src/lambda/getOffers';
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBDocumentClient, QueryCommand} from "@aws-sdk/lib-dynamodb";
import * as data from './data.json';
import { getUsername } from '../src/lambda/getOffers';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe('Lambda getOffers parameters', () => {
  test('No requestType should return 400', async () => {
    const res = await getOffersHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: 'STEAMID',
          },
        },
      },
    });
    expect(res.statusCode).toBe(400);
  });

  test('No steamid should return 400', async () => {
    const res = await getOffersHandler({requestType: 'USER'});
    expect(res.statusCode).toBe(400);
  });

  test('Invalid requestType should return 400', async () => {
    const res = await getOffersHandler({requestType: 'INVALID'});
    expect(res.statusCode).toBe(400);
  });
});

describe('Lambda getOffers with requestType \'all\'', () => {
  test('Error in query should return 500', async () => {
    ddbMock.on(QueryCommand).rejects('Error');
    const res = await getOffersHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '01234567890123456',
            requestType: 'all',
          },
        },
      },
    });
    expect(res.statusCode).toBe(500);
  });

  test('Error in query in getItemsFromOffers should return 500', async () => {
    const mockFunction = jest.fn().mockReturnValueOnce({
      Items: data["array-offers"],
    });

    jest.mock('../src/lambda/getOffers', () => ({
      getAllOffers: jest.fn().mockImplementation(mockFunction),
    }));

    ddbMock.on(QueryCommand).rejects('Error');

    const res = await getOffersHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '01234567890123456',
            requestType: 'all',
          },
        },
      },
    });
    expect(res.statusCode).toBe(500);
  });

  test('No error should return status 200 with list', async () => {
    const mockFunction = jest.fn().mockReturnValueOnce({
      Items: data["array-offers"]
    });

    ddbMock.on(QueryCommand).resolves({
      Items: data["item-offers"],
    });


    jest.mock('../src/lambda/getOffers', () => ({
      getAllOffers: jest.fn().mockImplementation(mockFunction),
    }));

    const res = await getOffersHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '01234567890123456',
            requestType: 'all',
          },
        },
      },
    });
    expect(res.statusCode).toBe(200);
  });
});

describe('Lambda getOffers with requestType \'USER\'', () => {
  test('Error in query should return 500', async () => {
    ddbMock.on(QueryCommand).rejects('Error');
    const res = await getOffersHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '01234567890123456',
            requestType: 'user',
          },
        },
      },
    });
    expect(res.statusCode).toBe(500);
  });

  test('User request with no steamid should return 400', async () => {
    const res = await getOffersHandler({
      requestContext: {
        authorizer: {
          lambda: {
            requestType: 'user',
          },
        },
      },
    });
    expect(res.statusCode).toBe(400);
  });

  test('Error in query in getItemsFromOffers should return 500', async () => {
    const mockFunction = jest.fn().mockReturnValueOnce({
      Items: data["array-offers"],
    });
    jest.mock('../src/lambda/getOffers', () => ({
      offersFromSteamId: jest.fn().mockImplementation(mockFunction),
    }));
    ddbMock.on(QueryCommand).rejects('Error');
    const res = await getOffersHandler({
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '01234567890123456',
            requestType: 'user',
          },
        },
      },
    });
    expect(res.statusCode).toBe(500);
  });
});

describe('Test getUsername', () => {
  test('Correct steamid should return username', async () => {
    expect(await getUsername('76561198024905796')).toBe('kennyS');
  });
  test('Incorrect steamid should throw an error', async () => {
    expect(await getUsername('salut')).toBe("Error");
  });
});
