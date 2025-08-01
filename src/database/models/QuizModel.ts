import fs from "fs/promises";
import { fileURLToPath } from "node:url";

import { delay } from "#utils/utils";

import BaseModel from "./BaseModel";
import { type QuizType } from "../../types/index";
import { winstonLogger } from "server_middleware";
import path from "path";

class QuizModel extends BaseModel<QuizType> {
  protected override isWriting = false;

  protected override filePath = fileURLToPath(
    import.meta.resolve(
      path.join("..", "data", "quiz.json"),
      import.meta.dirname,
    ),
  );

  protected override modelName = "Quiz";

  public override async getAll(): Promise<QuizType[]> {
    while (this.isWriting) {
      await delay(10);
    }

    winstonLogger.info(`fetching all data for ${this.modelName}`);

    return (
      JSON.parse(await fs.readFile(this.filePath, "utf8")) as QuizType[]
    ).map(
      (quiz, id) =>
        ({
          id,
          data: quiz.map((question) => ({
            question: question.question,
            option: question.option,
          })),
        }) as unknown as QuizType,
    );
  }

  public override async findById(id: number): Promise<QuizType> {
    while (this.isWriting) {
      await delay(10);
    }

    if (Number.isNaN(id)) {
      throw new Error(`Invalid ${this.modelName} id`);
    }

    const data = JSON.parse(
      await fs.readFile(this.filePath, "utf-8"),
    ) as QuizType[];

    if (data.length <= id || id < 0) {
      throw new Error(`${this.modelName} with id: ${id} doesn't exists`);
    }

    winstonLogger.info(`Fetching data for ${this.modelName} with id: ${id}`);

    return {
      id,
      data: data[id].map((question) => ({
        question: question.question,
        option: question.option,
      })),
    } as unknown as QuizType;
  }
}

export default new QuizModel();
