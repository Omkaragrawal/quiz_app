import type User from "#database/models/user";
import type { InferAttributes } from "sequelize";
import type { Logger } from "winston";

declare module "express-serve-static-core" {
  interface Request {
    logger: Logger;
    requestId: string;
    user?: InferAttributes<User>;
  }
}
