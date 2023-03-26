import {describe, expect, test} from '@jest/globals';
import { v4 } from 'uuid';
import { handler as offerAuthorizerHandler } from '../src/lambda/offerAuthorizer';
const jwt = require('jsonwebtoken');

describe('Lambda offerAuthorizer', () => {
  const secret = v4();
  const validToken = jwt.sign({ data: '123' }, secret, { expiresIn: '12h' });
  const emptyToken = jwt.sign({ data: '' }, secret, { expiresIn: '12h' });
  process.env.JWT_SECRET = secret;

  test('No requestType should return unauthorized', async () => {
    const res = await offerAuthorizerHandler({});
    expect(res.isAuthorized).toBe(false);
  });

  test('Invalid requestType should return unauthorized', async () => {
    const res = await offerAuthorizerHandler({
      queryStringParameters: {
        requestType: 'invalid',
      },
    });
    expect(res.isAuthorized).toBe(false);
  });

  test('all requestType should return authorized', async () => {
    const res = await offerAuthorizerHandler({
      queryStringParameters: {
        requestType: 'all',
      },
    });
    expect(res.isAuthorized).toBe(true);
  });

  test('user requestType with no token should return unauthorized', async () => {
    const res = await offerAuthorizerHandler({
      queryStringParameters: {
        requestType: 'user',
      },
    });
    expect(res.isAuthorized).toBe(false);
  });

  test('user requestType and valid token should return authorized', async () => {
    const res = await offerAuthorizerHandler({
      queryStringParameters: {
        requestType: 'user',
      },
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    });
    expect(res.isAuthorized).toBe(true);
  });

  test('user requestType and empty token should return unauthorized', async () => {
    const res = await offerAuthorizerHandler({
      queryStringParameters: {
        requestType: 'user',
      },
      headers: {
        authorization: `Bearer ${emptyToken}`,
      },
    });
    expect(res.isAuthorized).toBe(false);
  });
});
