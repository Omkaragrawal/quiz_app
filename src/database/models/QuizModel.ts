import fs from "fs/promises";

import BaseModel from "./BaseModel";
import { type QuizType } from "../../types/index";
import { delay } from "#utils/utils";
import { winstonLogger } from "server_middleware";

class QuizModel extends BaseModel<QuizType> {
  protected override isWriting = false;

  protected override filePath = "../data/quiz.json";

  protected override modelName = "Quiz";

  public override async findById(id: number): Promise<QuizType> {
    while (this.isWriting) {
      await delay(10);
    }

    if (Number.isNaN(id)) {
      throw new Error("Invalid quiz id");
    }

    const data = JSON.parse(
      await fs.readFile(this.filePath, "utf-8"),
    ) as QuizType[];

    if (data.length <= id || id < 0) {
      throw new Error(`Quiz with id: ${id} doesn't exists`);
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
