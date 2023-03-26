import {describe, expect, test} from '@jest/globals';
import { handler as postOfferHandler } from '../src/lambda/postOffer';
const jwt = require('jsonwebtoken');

describe('Lambda postOffer', () => {
  test('No steamid should return a status code 400', async () => {
    const event = {
      requestContext: {
        authorizer: {
          lambda: {}
        }
      },
      body: JSON.stringify({
        offer: {
          desiredItems: [],
          userItems: [],
        },
      }),
    };
    const response = await postOfferHandler(event);
    expect(response.statusCode).toBe(400);
  });

  test('Missing body should return a status code 500', async () => {
    const event = {
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '123'
          }
        }
      }
    };
    const response = await postOfferHandler(event);
    expect(response.statusCode).toBe(500);
  });

  test('Missing offer should return a status code 400', async () => {
    const event = {
      requestContext: {
        authorizer: {
          lambda: {
            steamid: '123'
          }
        }
      },
      body: JSON.stringify({
        desiredItems: [],
        userItems: [],
      }),
    };
    const response = await postOfferHandler(event);
    expect(response.statusCode).toBe(400);
  });
});
