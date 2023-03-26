import { DynamoDB } from "../shared/DynamoDB";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UserOffer } from "../utils/interfaces";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from 'uuid';
import { getShardNumber } from "../utils/shards";

const getItemsEntities = (offer: UserOffer, offerId: string, steamid: string) => {
  const userItems = offer.userItems.reduce((items, current: any, index) => {
    return [...items,  {
      PutRequest: {
        Item: {
          PK: `USER#${steamid}#OFFER#${offerId}`,
          SK: `USER-ITEM#${index}`,
          painting: current.name,
          url: current.icon_url,
          amount: current.amount,
        }
      }
    }]
  }, []);

  const desiredItems = offer.desiredItems.reduce((items, current: any, index) => {
    return [...items,  {
      PutRequest: {
        Item: {
          PK: `USER#${steamid}#OFFER#${offerId}`,
          SK: `DESIRED-ITEM#${index}`,
          painting: current.painting,
          url: current.url,
          amount: current.amount,
          type: current["weapon-type"],
        }
      }
    }]
  }, []);

  return [...userItems, ...desiredItems];
}

const getOfferEntity = (steamid: string) => {
  const now = DateTime.now().toISO();
  const id = uuidv4();

  return {
    PutRequest: {
      Item: {
        PK: `OFFERS#${getShardNumber()}`,
        SK: now,
        "GSI1-PK": `USER#${steamid}`,
        "GSI1-SK": `OFFER#${id}`,
      }
    }
  };
}

const storeOffer = async (offer: any, items: any[]) => {
  const client = new DynamoDB(process.env.DB_USERS!, new DynamoDBClient({}));

  await client.batchWrite({
    RequestItems: {
      [process.env.DB_USERS!]: [offer, ...items]
    }
  });
}

export const handler = async (event: any) => {
  try {
  const steamid = event?.requestContext?.authorizer?.lambda?.steamid!;
  const offer = JSON.parse(event?.body)?.offer!;
  if (!offer || !steamid)
    return {
      statusCode: 400,
      message: 'Bad request',
    };

    const offerEntity = getOfferEntity(steamid);
    const items = getItemsEntities(offer, offerEntity.PutRequest.Item["GSI1-SK"].split('#')[1], steamid);
    await storeOffer(offerEntity, items);

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
