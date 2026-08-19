import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: number;
      email: string;
      [key: string]: any;
    };
  }
}