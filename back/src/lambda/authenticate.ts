import { SteamAuth } from "../utils/steamAuth";
import { getUser, registerUser } from "../dynamodb/user";
import { User } from "../utils/interfaces";

const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');

const app = express();

const createToken = (steamid: string): string => {
  try {
    const token = jwt.sign({
      data: steamid,
    }, process.env.JWT_SECRET, { expiresIn: '12h' });
    return token;
  } catch (e) {
    throw new Error('Unable to generate JWT token');
  }
};

app.get('/authenticate', async (req: any, res: any) => {
  const params = new URLSearchParams();

  const client = new SteamAuth(
    process.env.HOSTNAME,
    `${process.env.API_URL}/authenticate`,
    process.env.STEAM_API_KEY,
  );
  try {
    const userData: User = await client.authenticate(req);
    const user = await getUser(userData.steamid);
    if (!user?.steamid!)
      await registerUser(userData.steamid);

    const token = createToken(user.steamid);
    params.set('userSession', token);

    return res.redirect(`${process.env.HOSTNAME}/authenticate?${params.toString()}`);
  } catch (e) {
    return res.redirect(`${process.env.HOSTNAME}/error`);
  }
});

module.exports.authenticate = serverless(app);
