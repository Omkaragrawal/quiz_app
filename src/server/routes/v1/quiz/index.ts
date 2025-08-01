/* eslint-disable @typescript-eslint/naming-convention */
import QuizModel from "#database/models/QuizModel";
import type { QuizType } from "../../../../types/index";
import express from "express";
import type { Request, Response } from "express";
import {
  checkExact,
  checkSchema,
  matchedData,
  validationResult,
} from "express-validator";

const app = express.Router();

//TODO: User Authorization and other checks
// import { quizRouteAuthenticationMiddleware } from "server_middleware";
// app.use(quizRouteAuthenticationMiddleware);

// Routes
// Get all quiz
app.get("/quiz/all", async (_, res: Response): Promise<void> => {
  //TODO: User Authorization and other checks
  // if (!req.user?.id) {
  //   res.status(404).send("User not found, please try again later.");
  //   return;
  // }

  const quiz = await QuizModel.getAll();

  res.json(quiz);
});

// Get a specific quiz
app.get(
  "/quiz/:id",
  checkExact(
    checkSchema({
      id: {
        in: ["params"],
        exists: true,
        isString: true,
        escape: true,
        trim: true,
        isNumeric: true,
        isInt: true,
        toInt: true,
        errorMessage: "Invalid quiz selected, please try again",
      },
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    //TODO: User Authorization and other checks
    // if (!req.user?.id) {
    //   res.status(404).send("User not found, please try again later.");
    //   return;
    // }

    const { id } = matchedData<{ id: number }>(req);

    try {
      const quiz = await QuizModel.findById(Number(id));
      res.json(quiz);
      return;
    } catch (error) {
      if ((error as Error).message.includes("doesn't exists")) {
        res.status(404).json({ message: "Quiz not found" });
        return;
      }

      throw error;
    }
  },
);

// Create a new quiz
app.post(
  "/quiz",
  checkExact(
    checkSchema({
      quiz: {
        in: ["body"],
        exists: { options: { checkNull: true } },
        isArray: { options: { min: 1 } },
        toArray: true,
        errorMessage: "Invalid quiz selected, please try again",
      },
      "quiz.*": {
        isObject: true,
        exists: { options: { checkNull: true } },
      },
      "quiz.*.question": {
        exists: { options: { checkNull: true } },
        isString: true,
        escape: true,
        isLength: { options: { min: 5 } },
        notEmpty: { options: { ignore_whitespace: true } },
        trim: true,
        errorMessage: "Please enter a valid question",
      },
      "quiz.*.options": {
        exists: { options: { checkNull: true } },
        isArray: true,
        isLength: { options: { min: 4 } },
        toArray: true,
        errorMessage: "Please enter valid options",
      },
      "quiz.*.options.*": {
        exists: { options: { checkNull: true } },
        isString: true,
        // escape: true,
        // isLength: { options: { min: 5 } },
        notEmpty: { options: { ignore_whitespace: true } },
        trim: true,
        errorMessage: "Please enter a valid option statement",
      },
      "quiz.*.answer": {
        exists: { options: { checkNull: true } },
        isInt: { options: { min: 0, max: 3 } },
        toInt: true,
        errorMessage: "Please enter a valid answer",
      },
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    try {
      //TODO: User Authorization and other checks
      // if (!req.user?.id) {
      //   res.status(404).send("User not found, please try again later.");
      //   return;
      // }

      if (!validationResult(req).isEmpty()) {
        res.status(403).json(validationResult(req).array());
        return;
      }
      const { quiz } = matchedData<{
        quiz: QuizType;
      }>(req);

      const id = await QuizModel.create(quiz);

      res.status(201).json({ id, data: quiz });
    } catch (err) {
      req.logger.log("error", { err });
      res.status(500).send("Issue in saving the quiz, please try again later.");
      return;
    }
  },
);

// Update a quiz
app.patch(
  "/quiz/:id",
  checkExact(
    checkSchema({
      id: {
        in: ["params"],
        exists: true,
        isString: true,
        escape: true,
        trim: true,
        isNumeric: true,
        isInt: true,
        toInt: true,
        errorMessage: "Invalid quiz selected, please try again",
      },
      quiz: {
        in: ["body"],
        exists: { options: { checkNull: true } },
        isArray: { options: { min: 1 } },
        toArray: true,
        errorMessage: "Invalid quiz selected, please try again",
      },
      "quiz.*": {
        isObject: true,
        exists: { options: { checkNull: true } },
      },
      "quiz.*.question": {
        exists: { options: { checkNull: true } },
        isString: true,
        escape: true,
        isLength: { options: { min: 5 } },
        notEmpty: { options: { ignore_whitespace: true } },
        trim: true,
        errorMessage: "Please enter a valid question",
      },
      "quiz.*.options": {
        exists: { options: { checkNull: true } },
        isArray: true,
        isLength: { options: { min: 4 } },
        toArray: true,
        errorMessage: "Please enter valid options",
      },
      "quiz.*.answer": {
        exists: { options: { checkNull: true } },
        isInt: { options: { min: 0, max: 3 } },
        toInt: true,
        errorMessage: "Please enter a valid answer",
      },
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    try {
      //TODO: User Authorization and other checks
      // if (!req.user?.id) {
      //   res.status(404).send("User not found, please try again later.");
      //   return;
      // }

      if (!validationResult(req).isEmpty()) {
        res.status(403).json(validationResult(req).array());
        return;
      }
      const { id, quiz } = matchedData<{
        id: number;
        quiz: QuizType;
      }>(req);

      try {
        const { old: oldQuiz, new: updatedQuiz } = await QuizModel.update(
          id,
          quiz,
        );

        req.logger.log("info", `Quiz with ID: ${id} was update`, {
          oldData: oldQuiz,
          newData: updatedQuiz,
        });

        res.json(updatedQuiz);
      } catch (error) {
        if ((error as Error).message.includes("doesn't exists")) {
          res.status(404).json({ message: "Quiz not found" });
          return;
        }

        throw error;
      }
    } catch (err) {
      req.logger.log("crit", { err });
      res
        .status(500)
        .send("Issue in updating the quiz, please try again later.");
      return;
    }
  },
);

// Delete a quiz
app.delete(
  "/quiz/:id",
  checkExact(
    checkSchema({
      id: {
        in: ["params"],
        exists: true,
        isString: true,
        escape: true,
        trim: true,
        isNumeric: true,
        isInt: true,
        toInt: true,
        errorMessage: "Invalid quiz selected, please try again",
      },
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    try {
      //TODO: User Authorization and other checks
      // if (!req.user?.id) {
      //   res.status(404).send("User not found, please try again later.");
      //   return;
      // }

      if (!validationResult(req).isEmpty()) {
        res.status(403).json(validationResult(req).array());
        return;
      }
      const { id } = matchedData<{ id: number }>(req);

      try {
        await QuizModel.delete(Number(id));
      } catch (error) {
        if ((error as Error).message.includes("doesn't exists")) {
          res.status(404).json({ message: "Quiz not found" });
          return;
        }

        throw error;
      }

      res.status(204).json({ success: true });
    } catch (err) {
      req.logger.log("crit", { err });
      res
        .status(500)
        .send("Issue in deleting the quiz, please try again later.");
      return;
    }
    return;
  },
);

export default app;
