import type { NextFunction } from "express";
import express, { type Request, type Response } from "express";
import compression from "compression";
import Env from "#utils/env";
import cookie from "cookie-parser";

import apiRouter from "./server/routes/v1/index";
import {
  addLoggerAndRequestIdMiddleware,
  helmetMiddleware,
  morganLogger,
  quizRouteAuthenticationMiddleware,
  routeNoAuthenticationMiddleware,
  winstonLogger,
} from "server_middleware";

const server = express();

// server.enable("trust proxy");
server.enable("case sensitive routing");
server.enable("env");
server.enable("json escape");

server.use(helmetMiddleware);

/**
 * TODO: Add a middleware to handle auth using bearer token
 */

server.use(compression());
server.use(cookie(Env.JWT_SECRET as string));
server.use(express.json());
server.use(
  express.urlencoded({
    extended: true,
  }),
);

server.use(morganLogger);
server.use(addLoggerAndRequestIdMiddleware);

server.use("/api/v1", apiRouter);

server.get(
  "/",
  routeNoAuthenticationMiddleware,
  (_: Request, __: Response, next: NextFunction) => {
    return next();
  },
);

server.use([
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.path.startsWith("/quiz")) {
      next();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      quizRouteAuthenticationMiddleware(req, res, next);
    }
  },
]);

server.listen(Env.PORT, (): void => {
  winstonLogger.log("debug", `Ready on http://localhost:${Env.PORT as string}`);
});
