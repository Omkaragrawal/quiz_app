/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type {} from "../../../../types/index";
import express from "express";
import type { Request, Response } from "express";
import {
  checkExact,
  checkSchema,
  matchedData,
  validationResult,
} from "express-validator";
import { quizRouteAuthenticationMiddleware } from "server_middleware";

const app = express.Router();

app.use(quizRouteAuthenticationMiddleware);

// Routes
// Get all quiz
app.get("/quiz", async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(404).send("User not found, please try again later.");
    return;
  }

  await Promise.resolve();

  const quiz = {};

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
    if (!validationResult(req).isEmpty()) {
      res.status(403).json(validationResult(req).array());
      return;
    }
    matchedData<{ id: number }>(req);
    await Promise.resolve();

    if (!req.user?.id) {
      res.status(404).send("User not found, please try again later.");
      return;
    }

    const quiz = {};

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.json(quiz);
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
        isLength: { options: { min: 4, max: 4 } },
        toArray: true,
        errorMessage: "Please enter valid options",
      },
      "quiz.*.answer": {
        exists: { options: { checkNull: true } },
        isInt: { options: { min: 0, max: 3 } },
        toInt: true,
        errorMessage: "Please enter a valid answer",
      },
      notes: {
        in: ["body"],
        optional: { options: { nullable: true } },
        isString: true,
        trim: true,
        escape: true,
      },
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(404).send("User not found, please try again later.");
        return;
      }
      if (!validationResult(req).isEmpty()) {
        res.status(403).json(validationResult(req).array());
        return;
      }
      matchedData<{
        quiz: unknown[];
        notes?: string | null;
      }>(req);

      await Promise.resolve();

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 14); // 14 days by default

      const newQuiz = [] as unknown[];

      res.status(201).json(newQuiz);
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
        isLength: { options: { min: 4, max: 4 } },
        toArray: true,
        errorMessage: "Please enter valid options",
      },
      "quiz.*.answer": {
        exists: { options: { checkNull: true } },
        isInt: { options: { min: 0, max: 3 } },
        toInt: true,
        errorMessage: "Please enter a valid answer",
      },
      notes: {
        in: ["body"],
        optional: { options: { nullable: true } },
        isString: true,
        trim: true,
        escape: true,
      },
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(404).send("User not found, please try again later.");
        return;
      }

      if (!validationResult(req).isEmpty()) {
        res.status(403).json(validationResult(req).array());
        return;
      }
      const { id, notes: newNote } = matchedData<{
        id: number;
        quiz: unknown[];
        notes?: string | null;
      }>(req);

      await Promise.resolve();

      const notes = {} as { notes: string | null };

      if (newNote === null || newNote) {
        notes.notes = newNote;
      }

      const [affectedRowCountOld, oldQuiz] = [] as unknown[];

      if (affectedRowCountOld) {
        res.status(404).json({ message: "Quiz not found" });
        return;
      }

      const updatedQuiz = {};

      req.logger.log("info", `Quiz with ID: ${id} was update`, {
        oldData: oldQuiz,
        newData: updatedQuiz,
      });

      res.redirect(303, "/quiz/view/" + JSON.stringify(updatedQuiz));
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
      if (!validationResult(req).isEmpty()) {
        res.status(403).json(validationResult(req).array());
        return;
      }
      matchedData<{ id: number }>(req);

      await Promise.resolve();

      const [affectedRowCount, quiz] = [] as unknown[];

      if (affectedRowCount) {
        res.status(404).json({ message: "Quiz not found" });
        return;
      }

      req.logger.log("info", `Quiz with ID: ${1} was marked as deleted`, quiz);

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
