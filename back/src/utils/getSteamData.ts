const axios = require('axios');

export const getSteamData = async (steamid: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const response = await axios.get(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    );

    const player = response?.data?.response?.players?.[0];
    if (!player)
      reject('Unable to get user');
    resolve(player);
  });
}
