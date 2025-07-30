import type { NextFunction, Request, Response } from "express";
import { DateTime } from "luxon";
import morgan from "morgan";
import { nanoid } from "nanoid";
import { createStream } from "rotating-file-stream";
import winston from "winston";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import { CookieNamesEnum } from "./types/index";
import * as jose from "jose";
import env from "#utils/env";

const baseFileName = `logs/${DateTime.now().startOf("day").toFormat("dd-MM-yyyy")}-quiz-app`;

// create a log stream
const winstonNoticeStream = createStream(`${baseFileName}-notice-log.txt`, {
  size: "20M",
  interval: "1d",
  compress: "gzip",
});
const winstonErrorStream = createStream(`${baseFileName}-error-log.txt`, {
  size: "20M",
  interval: "1d",
  compress: "gzip",
});
const winstonCriticalStream = createStream(`${baseFileName}-critical-log.txt`, {
  size: "20M",
  interval: "1d",
  compress: "gzip",
});
const winstonEmergencyStream = createStream(
  `${baseFileName}-emergencies-log.txt`,
  {
    size: "20M",
    interval: "1d",
    compress: "gzip",
  },
);

// create a log stream
const stream = createStream(`${baseFileName}-request-log.txt`, {
  size: "20M",
  interval: "1d",
  compress: "gzip",
});

morgan.token("id", function (req: Request) {
  return req.requestId;
});

export const helmetMiddleware = helmet({
  // add script-src unsafe-inline
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*", "'unsafe-inline'"],
      scriptSrc: ["'self'", "*", "'unsafe-inline'"],
      imgSrc: ["'self'", "*", "data:"],
    },
  },
});

export const winstonLogger = winston.createLogger({
  exitOnError: false,
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      forceConsole: true,
      level: "debug",
      format: winston.format.combine(
        winston.format.ms(),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
        winston.format.splat(),
        winston.format.colorize({ all: true }),
      ),
    }),
    new winston.transports.Stream({
      stream: winstonNoticeStream,
      format: winston.format.combine(
        winston.format.ms(),
        winston.format.metadata(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
      level: "notice",
    }),
    new winston.transports.Stream({
      stream: winstonErrorStream,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.ms(),
        winston.format.metadata(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
      level: "error",
      handleExceptions: true,
    }),
    new winston.transports.Stream({
      stream: winstonCriticalStream,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.ms(),
        winston.format.metadata(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
      level: "crit",
      handleRejections: true,
    }),
    new winston.transports.Stream({
      stream: winstonEmergencyStream,
      format: winston.format.combine(
        winston.format.ms(),
        winston.format.metadata(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
      level: "emerg",
      handleRejections: true,
    }),
  ],
  handleExceptions: true,
  handleRejections: true,
});

export const morganLogger = morgan(
  ':id - :remote-addr - :remote-user [:date] ":method :url ' +
    'HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  {
    stream,
  },
);

export const addLoggerAndRequestIdMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction,
): void => {
  const requestId = nanoid();
  req.requestId = requestId;
  // Logger setup
  winstonLogger.defaultMeta = { requestId };
  req.logger = winstonLogger;
  next();
};

export const limiter = expressRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Limit each IP to 50 requests per `window` (here, per 1 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
});

export const quizRouteAuthenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.signedCookies[CookieNamesEnum.RANDOM_COOKIE_NAME] as string;

  if (!token) {
    res.redirect(302, "/");
    return;
  }

  try {
    // const { payload } = await jose.jwtVerify(
    await jose.jwtVerify(
      token,
      new TextEncoder().encode(env.JWT_SECRET as string),
    );

    // req.user = payload as Record<string, unknown>;
    // req.user.createdAt = DateTime.fromISO(
    //   req.user.createdAt as unknown as string,
    // );
    // req.user.updatedAt = DateTime.fromISO(
    //   req.user.updatedAt as unknown as string,
    // );
    next();
  } catch (err) {
    res.clearCookie(CookieNamesEnum.RANDOM_COOKIE_NAME);
    console.error({ err });
    res.redirect(302, "/");
    return;
  }
};

export const routeNoAuthenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.signedCookies[CookieNamesEnum.RANDOM_COOKIE_NAME] as string;

  if (!token) {
    next();
    return;
  }

  try {
    await jose.jwtVerify(
      token,
      new TextEncoder().encode(env.JWT_SECRET as string),
    );

    res.redirect(302, "/quiz");
    return;
  } catch {
    res.clearCookie(CookieNamesEnum.RANDOM_COOKIE_NAME);
    next();
  }
  next();
};
