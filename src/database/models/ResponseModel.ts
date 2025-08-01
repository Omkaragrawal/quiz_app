import fs from "fs/promises";
import { fileURLToPath } from "node:url";

import { delay } from "#utils/utils";

import BaseModel from "./BaseModel";
import { type ResponseType } from "../../types/index";
import { winstonLogger } from "server_middleware";
import path from "path";

class QuizModel extends BaseModel<ResponseType> {
  protected override isWriting = false;

  protected override filePath = fileURLToPath(
    import.meta.resolve(
      path.join("..", "data", "response.json"),
      import.meta.dirname,
    ),
  );

  protected quizFilePath = fileURLToPath(
    import.meta.resolve(
      path.join("..", "data", "quiz.json"),
      import.meta.dirname,
    ),
  );

  protected userFilePath = fileURLToPath(
    import.meta.resolve(
      path.join("..", "data", "user.json"),
      import.meta.dirname,
    ),
  );

  protected override modelName = "Response";

  public override async getAll(): Promise<ResponseType[]> {
    while (this.isWriting) {
      await delay(10);
    }

    winstonLogger.info(`fetching all data for ${this.modelName}`);

    return JSON.parse(
      await fs.readFile(this.filePath, "utf8"),
    ) as ResponseType[];
  }

  public override async findById(id: number): Promise<ResponseType> {
    while (this.isWriting) {
      await delay(10);
    }

    if (Number.isNaN(id)) {
      throw new Error(`Invalid ${this.modelName} id`);
    }

    const data = JSON.parse(
      await fs.readFile(this.filePath, "utf-8"),
    ) as ResponseType[];

    if (data.length <= id || id < 0) {
      throw new Error(`${this.modelName} with id: ${id} doesn't exists`);
    }

    winstonLogger.info(`Fetching data for ${this.modelName} with id: ${id}`);

    return {
      id,
      data: data[id],
    } as unknown as ResponseType;
  }

  public async getResultForQuiz(userId: number, quizId: number): Promise<ResponseType> {
    
  }
}

export default new QuizModel();
