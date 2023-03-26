const jwt = require('jsonwebtoken');

export const handler = async (event: any) => {
  try {
    const authorizationToken = event?.headers?.Authorization?.split(' ')[1]!;

    const decoded = jwt.verify(authorizationToken, process.env.JWT_SECRET);
    const steamid = decoded?.data!;
    if (!steamid)
      return { isAuthorized: false };
    return { isAuthorized: true, context: { steamid } };
  } catch (e) {
    return { isAuthorized: false };
  }
}
