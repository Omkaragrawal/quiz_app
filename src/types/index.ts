import { type DateTime } from "luxon";

export interface User {
  id: number;
  name: string;
  createdAt: string | DateTime;
  updatedAt: string | DateTime;
}

export type QuizType = {
  question: string;
  option: string[];
  answer: 0 | 1 | 2 | 3;
}[];
export enum EnvironmentKeysEnum {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  NODE_ENV = "NODE_ENV",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PORT = "PORT",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  JWT_ALGO = "JWT_ALGO",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  JWT_SECRET = "JWT_SECRET",
}

export enum CookieNamesEnum {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  RANDOM_COOKIE_NAME = "RANDOM_COOKIE_NAME",
}
