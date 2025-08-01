import { type DateTime } from "luxon";

export interface User {
  id: number;
  name: string;
  createdAt: string | DateTime;
  updatedAt: string | DateTime;
}

export interface QuestionType {
  question: string;
  options: string[];
  answer: 0 | 1 | 2 | 3;
}

export type QuizType = QuestionType[];

export type UserType = Record<string, unknown>;

export interface ResponseType {
  userId: number;
  responses: {
    score: number;
    responses: number[];
  }[];
}

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
