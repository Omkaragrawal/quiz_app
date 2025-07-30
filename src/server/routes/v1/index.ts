import type { Request, Response, Router } from "express";
import express from "express";
import * as jose from "jose";
import { DateTime } from "luxon";
import {
  checkExact,
  checkSchema,
  validationResult,
  matchedData,
} from "express-validator";

import quizRouter from "./quiz/index";
import env from "#utils/env";

import { CookieNamesEnum } from "../../../types/index";
import UTILS from "#utils/utils";
import { routeNoAuthenticationMiddleware, limiter } from "server_middleware";

const router: Router = express.Router();

router.use(limiter);

router.post(
  "/login",
  routeNoAuthenticationMiddleware,
  checkExact(
    checkSchema({
      email: {
        in: ["body"],
        exists: true,
        isString: true,
        escape: true,
        isEmail: true,
        normalizeEmail: true,
        trim: true,
        errorMessage: "Please enter a valid email address",
      },
      mobile: {
        in: ["body"],
        exists: true,
        isString: true,
        escape: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        isMobilePhone: { locale: ["en-IN"] },
        trim: true,
        errorMessage: "Please enter a valid mobile",
      },
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.status(403).json(validationResult(req).array());
      return;
    }
    matchedData<{
      email: string;
      mobile: string;
    }>(req);

    const existingUser = {};

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!existingUser) {
      res.status(401).send("Wrong credentials please try again");
      return;
    }

    const expiration = DateTime.now().plus({ day: 1 });

    const user = existingUser;

    // (user.createdAt as unknown as string | null) = user.createdAt.toISO({
    //   includeOffset: true,
    // });
    // (user.updatedAt as unknown as string | null) = user.updatedAt.toISO({
    //   includeOffset: true,
    // });

    const token = await new jose.SignJWT(user)
      .setProtectedHeader({ alg: env.JWT_ALGO as string })
      .setIssuedAt()
      .setExpirationTime(expiration.toJSDate())
      .sign(new TextEncoder().encode(env.JWT_SECRET as string));

    res
      .cookie(CookieNamesEnum.RANDOM_COOKIE_NAME, token, {
        httpOnly: true,
        secure: UTILS.checkIfProduction(),
        maxAge: expiration.toMillis(),
        sameSite: "strict",
        signed: true,
        priority: "high",
      })
      .redirect(303, "/quiz");
  },
);

router.use(quizRouter);

export default router;
