import {describe, expect, test} from '@jest/globals';
import { v4 } from 'uuid';
import { handler as authorizerHandler } from '../src/lambda/authorizer';
const jwt = require('jsonwebtoken');

describe('Lambda authorizer', () => {
  const secret = v4();
  const validToken = jwt.sign({ data: '123' }, secret, { expiresIn: '12h' });
  const expiredToken = jwt.sign({ data: '123' }, secret, { expiresIn: '0s' });
  process.env.JWT_SECRET = secret;

  test('Wrong token should return unauthorized response', async () => {
    expect(await authorizerHandler({
      headers: {
        'authorization': `Bearer WRONG_TOKEN`
      }
    })).toStrictEqual({
      isAuthorized: false,
    });
  });

  test('Correct token should return authorized response', async () => {
    expect(await authorizerHandler({
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    })).toStrictEqual({
      isAuthorized: true,
      context: {
        steamid: '123'
      }
    });
  });

  test('Malformed parameters should return unauthorized response', async () => {
    expect(await authorizerHandler({
      headers: {
        'malformed': `Bearer ${validToken}`
      }
    })).toStrictEqual({
      isAuthorized: false,
    });
  });

  test('Expired token should return unauthorized response', async () => {
    expect(await authorizerHandler({
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    })).toStrictEqual({
      isAuthorized: false,
    });
  });
});
