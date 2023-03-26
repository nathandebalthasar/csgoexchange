export interface Translations<T> {
  [key: string]: {
    create: {
      [key: string]: T;
    };
    home: {
      [key: string]: T;
    };
    "user-trades": {
      [key: string]: T;
    };
    pages: {
      [key: string]: T;
    },
    settings: {
      [key: string]: T;
    },
  };
}
