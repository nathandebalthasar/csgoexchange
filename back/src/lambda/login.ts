import { SteamAuth } from "../utils/steamAuth";

export const login = async () => {
  const client = new SteamAuth(
      process.env.HOSTNAME,
      `${process.env.API_URL}/authenticate`,
      process.env.STEAM_API_KEY,
  );

  try {
    const redirectUrl = await client.getRedirectUrl();
    return {
      statusCode: 302,
      headers: { Location: redirectUrl }
    };
  } catch (e) {
    return {
      statusCode: 500,
      message: 'Internal server error'
    };
  }
}
