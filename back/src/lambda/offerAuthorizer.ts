import { REQUEST_TYPE } from "./getOffers";
const jwt = require('jsonwebtoken');

export const handler = async (event: any) => {
  try {
    const requestType = event?.queryStringParameters.requestType!;
    if (requestType === REQUEST_TYPE.ALL)
      return { isAuthorized: true, context: { requestType } };
    else if (requestType === REQUEST_TYPE.USER) {
      const authorizationToken = event?.headers?.authorization?.split(' ')[1]!;
      const decoded = jwt.verify(authorizationToken, process.env.JWT_SECRET);
      const steamid = decoded?.data!;
      if (!steamid)
        return { isAuthorized: false };
      return { isAuthorized: true, context: { steamid, requestType } };
    } else {
      return { isAuthorized: false };
    }
  } catch (e) {
    return { isAuthorized: false };
  }
}
