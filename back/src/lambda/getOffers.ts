import { DynamoDB } from "../shared/DynamoDB";
import { SHARD_LIMIT } from "../utils/shards";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Item, Offer, ItemOffer, UserOffer } from "../utils/interfaces";
import { parse } from "node-html-parser";
import axios from 'axios';
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

export enum REQUEST_TYPE {
  USER = "user",
  ALL = "all"
}

export const getUsername = async (steamid: string) => {
  const res = await axios.get(`https://steamcommunity.com/profiles/${steamid}`);
  const root = parse(res.data);
  const username = root.querySelector('title').text.replace('Steam Community :: ', '');

  return username;
}

const validParameters = (requestType: string, steamid: string) => {
  if (requestType !== REQUEST_TYPE.USER && requestType !== REQUEST_TYPE.ALL)
    return false;
  if (requestType === REQUEST_TYPE.USER && !steamid)
    return false;
  return true;
}

export const getItemsFromOffers = async (offers: Offer[], client: DynamoDB) => {
  const result: UserOffer[] = [];
  await Promise.all(offers.map(async (offer: Offer) => {
    const res = await client.query({
      TableName: client.tableName,
      KeyConditionExpression: 'PK = :PK',
      ExpressionAttributeValues: {
        ':PK': `${offer["GSI1-PK"]}#${offer["GSI1-SK"]}`,
      },
    });

    const username = await getUsername(offer["GSI1-PK"].split('#')[1]);
    const userItems: ItemOffer[] = [];
    const desiredItems: ItemOffer[] = [];

    res?.Items?.forEach((item: Item) => {
      const toPush = {
        amount: item.amount,
        painting: item.painting,
      }
      if (item.SK.startsWith("USER-ITEM"))
        userItems.push({...toPush, url: `http://cdn.steamcommunity.com/economy/image/${item.url}`});
      else
        desiredItems.push({...toPush, type: item.type, url: item.url});
    });
    result.push({
      userItems,
      desiredItems,
      author: username,
      tradeUrl: offer.tradeUrl,
      timestamp: offer.SK,
      offerId: offer["GSI1-SK"].split('#')[1],
    });
  }));
  return result;
}

export const getAllOffers = async (client: DynamoDB) => {
  const offers: Offer[] = [];
  await Promise.all((Array(SHARD_LIMIT).fill(0)).map(async (_, i) => {
    const res = await client.query({
      TableName: client.tableName,
      KeyConditionExpression: 'PK = :PK',
      ExpressionAttributeValues: {
        ':PK': `OFFERS#${i}`,
      },
    });
    res?.Items?.forEach((item: any) => offers.push(item));
  }));
  return offers;
}

export const offersFromSteamId = async (client: DynamoDB, steamid: string) => {
  const params: QueryCommandInput = {
    TableName: client.tableName,
    IndexName: 'GSI1',
    KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': `USER#${steamid}`,
      ':SK': 'OFFER#',
    },
    ExpressionAttributeNames: {
      '#PK': 'GSI1-PK',
      '#SK': 'GSI1-SK',
    },
  };

  const res = await client.query(params);
  return res?.Items as Offer[];
}

const getOffers = async (client: DynamoDB, requestType: string, steamid: string) => {
  if (requestType === REQUEST_TYPE.USER) {
    return await offersFromSteamId(client, steamid!);
  }
  return await getAllOffers(client);
}

export const handler = async (event: any) => {
  const requestType = event?.requestContext?.authorizer?.lambda?.requestType!;
  const steamid = event?.requestContext?.authorizer?.lambda?.steamid!;

  if (!validParameters(requestType, steamid)) {
    return {
      statusCode: 400,
      message: "Bad request",
    };
  }

  const client = new DynamoDB(process.env.DB_USERS!, new DynamoDBClient({}));

  try {
    const offers = await getOffers(client, requestType, steamid);
    const offersWithItems = await getItemsFromOffers(offers, client);

    return {
      statusCode: 200,
      body: JSON.stringify(offersWithItems),
    };
  } catch (e) {
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }
}
