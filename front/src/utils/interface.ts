export interface InventoryItem {
  amount: number,
  name: string,
  icon_url: string,
}

export interface SteamItem {
  painting: string,
  url: string,
  amount?: number,
  "weapon-type": string
}

export interface ItemOffer {
  painting: string,
  url: string,
  amount: number,
  type?: string,
}

export interface ItemsResponse {
  desiredItems: ItemOffer[];
  userItems: ItemOffer[];
}

export interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
}
