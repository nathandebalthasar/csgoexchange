const axios = require('axios');

interface Asset {
  appid: number,
  contextid: string,
  assetid: string,
  classid: string,
  istanceid: string,
  amount: string,
}

interface AssetSorted {
  classid: string,
  amount: number,
}

interface Item {
  name: string,
  icon_url: string,
  amount: number,
}

interface Tag {
  category: string,
  internal_name: string,
  localized_category_name: string,
  localized_tag_name: string,
  color?: string,
}

const getItemsBatch = (assets: Asset[]) => {
  const itemsMap = assets.reduce((map, { classid }) => {
    if (!map.has(classid)) map.set(classid, { classid, amount: 0 });
    map.get(classid)!.amount++;
    return map;
  }, new Map<string, AssetSorted>());
  return Array.from(itemsMap.entries()).map(([classid, { amount }]) => ({ amount, classid }));
}

const getItemsList = (descriptions: any[], itemsBatch: any[]) => {
  const items = itemsBatch.map((item) => {
    const desc = descriptions.find((description) => description.classid === item.classid);
    if (desc)
      return {
        amount: item.amount,
        name: desc.market_name,
        icon_url: desc.icon_url
      };
  });
  return items.filter((item) => item);
}

export const handler = async (event: any) => {
  try {
    const steamid = event?.requestContext?.authorizer?.lambda?.steamid!;
    if (!steamid)
      return {
        statusCode: 400,
        message: 'Bad request',
      };

    const res = await axios.get(`https://steamcommunity.com/inventory/${steamid}/730/2`);
    if (!res?.data?.success)
      throw new Error('Unable to reach Steam API');
    const batch = getItemsBatch(res.data.assets);
    const descriptions = res.data.descriptions.filter((desc: any) => desc.tradable);
    const items = getItemsList(descriptions, batch);
    return {
      statusCode: 200,
      body: JSON.stringify(items),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }
}
