import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from "fs";

let itemsTypes = [];

let itemsGameCdn = readFileSync("./input/items_game_cdn.txt", "utf8")
    .split('\n')
    .slice(3)
    .map((line) => line.split("="))
    .map((elem, index) => {
        if (!elem[0]|| !elem[1]) {
            console.log(`${index}`);
            throw new Error("undefined value");
        }

        const type = elem[0].split('_').slice(0, 2).join('_');
        const name = elem[0].split('_').slice(2).join('_');

        if (!type || !name)
            return undefined;

        if (!itemsTypes.includes(type))
            itemsTypes.push(type);

        return {
            PutRequest: {
                Item: {
                    "PK": `ITEM#${type}`,
                    "SK": `${name}`,
                    "url": `${elem[1]}`
                }
            }
        }
    }).filter((elem) => elem !== undefined);;

// Format itemsTypes
itemsTypes = itemsTypes.map((type) => {
    return {
        PutRequest: {
            Item: {
                "PK": `ITEMTYPE`,
                "SK": `ITEMTYPE#${type}`,
            }
        }
    }
}).filter((elem) => elem !== undefined && elem.PutRequest.Item.SK !== undefined && elem.PutRequest.Item.PK !== undefined);

itemsGameCdn = [...itemsTypes, ...itemsGameCdn];

try {
    const dynamoDB = new DynamoDBClient({ region: process.env.REGION });
    const ddbClient = DynamoDBDocument.from(dynamoDB);

    let i = 0;

    while (itemsGameCdn.length > 0) {
        let obj = itemsGameCdn.slice(0, 25);
        itemsGameCdn.splice(0, 25);
        await ddbClient.send(new BatchWriteCommand({
            RequestItems: {
                [process.env.TABLE_NAME]: [...obj]
            }
        })).catch((e) => {
            itemsGameCdn = [...obj, ...itemsGameCdn];
            console.log('Error: retrying...' + e);
            i -= 25;
        });
        i += 25;
        console.log(`Remaining: ${itemsGameCdn.length - i}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
} catch (e) {
    console.log(e);
}
