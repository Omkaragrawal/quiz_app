import { type User } from "types";
import type { Logger } from "winston";

declare module "express-serve-static-core" {
  interface Request {
    logger: Logger;
    requestId: string;
    user?: User;
  }
}
