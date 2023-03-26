export interface Avatar {
  small: string,
  medium: string,
  large: string,
}

export interface User {
  steamid: string,
  username: string,
  profileUrl: string,
  country: string,
  avatar: Avatar,
}

export interface ItemOffer {
  painting: string,
  url: string,
  amount: number,
  type?: string,
}

export interface UserOffer {
  userItems: ItemOffer[],
  desiredItems: ItemOffer[],
  author?: string,
  timestamp?: string,
  tradeUrl?: string,
  offerId?: string,
}

export interface Offer {
  PK: string,
  SK: string,
  "GSI1-PK": string,
  "GSI1-SK": string,
  tradeUrl: string,
}

export interface Item {
  PK: string,
  SK: string,
  painting: string,
  amount: number,
  url: string,
  type?: string,
}
