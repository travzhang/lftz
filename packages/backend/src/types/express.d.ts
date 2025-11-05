// Type augmentation for Express Request to include `user` set by Passport
export {};

declare global {
  namespace Express {
    interface User {
      provider?: string;
      id?: string | number;
      displayName?: string;
      username?: string;
      emails?: Array<{ value: string }> | any;
      photos?: Array<{ value: string }> | any;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}
