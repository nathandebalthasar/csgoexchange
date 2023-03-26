import { getSteamData } from "../utils/getSteamData";
import { getUser } from "../dynamodb/user";

export const handler = async (event: any) => {
  try {
    const decodedToken = event?.requestContext?.authorizer?.lambda?.steamid!;
    if (!decodedToken)
      return {
        statusCode: 400,
        message: 'Bad request',
      };

    const playerInformation = await getSteamData(decodedToken);
    const userInformation = await getUser(decodedToken);
    const playerData = {
      steamid: decodedToken,
      username: playerInformation.personaname,
      avatar: playerInformation?.avatarfull,
      tradeUrl: userInformation?.tradeUrl!,
    };

    return {
      statusCode: 200,
      message: 'OK',
      body: JSON.stringify({ 'player': playerData }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }
}
