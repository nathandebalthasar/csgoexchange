import { RelyingParty, OpenIdError } from "openid";
import { User } from "./interfaces";

const axios = require("axios");
const openid = require("openid");

export class SteamAuth {
  realm: string;
  returnUrl: string;
  apiKey: string;
  relyingParty: RelyingParty;

  constructor(realm: string, returnUrl: string, apiKey: string) {
    if (!realm || !returnUrl || !apiKey)
      throw new Error('Missing required parameter(s)');

    this.realm = realm;
    this.returnUrl = returnUrl;
    this.apiKey = apiKey;
    this.relyingParty = new openid.RelyingParty(
      returnUrl,
      null,
      true,
      true,
      [],
    );
  }

  async getRedirectUrl() {
    return new Promise((resolve, reject) => {
      this.relyingParty.authenticate(
        'https://steamcommunity.com/openid',
        false,
        (err: OpenIdError, authUrl: string) => {
          if (err)
            return reject(err.message);
          else if (!authUrl)
            return reject('Authentication failed');
          return resolve(authUrl);
        }
      )
    });
  }

  async fetchIdentifier(steamOpenId: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
      const steamId = steamOpenId.replace(
        'https://steamcommunity.com/openid/id/',
        ''
      );

      try {
        const response = await axios.get(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`
        );
        const players =
          response.data &&
          response.data.response &&
          response.data.response.players;

        if (players && players.length > 0) {
          const player = players[0];

          const user: User = {
            steamid: steamId,
            username: player?.personaname,
            profileUrl: player?.profileurl,
            country: player?.loccountrycode,
            avatar: {
              small: player?.avatar,
              medium: player?.avatarmedium,
              large: player?.avatarfull
            }
          }
          if (Object.entries(user).some(([value]) => !value))
            reject('Unable to retrieve player\'s data');
          resolve(user);
        } else {
          reject('No players found for the given SteamID.');
        }
      } catch (error) {
        reject('Steam server error: ' + error.message);
      }
    });
  }

  async authenticate(req: any): Promise<User> {
    return new Promise((resolve, reject) => {
      this.relyingParty.verifyAssertion(req, async (error, result) => {
        if (error) return reject(error.message);
        if (!result || !result.authenticated)
          return reject('Failed to authenticate user.');
        if (
          !/^https?:\/\/steamcommunity\.com\/openid\/id\/\d+$/.test(
            result.claimedIdentifier
          )
        )
          return reject('Claimed identity is not valid.');

        try {
          const user: User = await this.fetchIdentifier(result.claimedIdentifier);
          return resolve(user);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
