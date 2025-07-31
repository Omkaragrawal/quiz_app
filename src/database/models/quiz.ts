import { delay } from "#utils/utils";
import fs from "fs/promises";
import { winstonLogger } from "server_middleware";
import { type QuizType } from "types";

class QuizModel {
  private isWriting = false;

  public async getAllQuiz(): Promise<QuizType[]> {
    while (this.isWriting) {
      await delay(10);
    }

    return JSON.parse(
      await fs.readFile("../data/quiz.json", "utf8"),
    ) as QuizType[];
  }

  public async findQuizById(id: number): Promise<QuizType> {
    while (this.isWriting) {
      await delay(10);
    }

    if (Number.isNaN(id)) {
      throw new Error("Invalid quiz id");
    }

    const data = JSON.parse(
      await fs.readFile("../data/quiz.json", "utf-8"),
    ) as QuizType[];

    if (data.length <= id || id < 0) {
      throw new Error(`Quiz with id: ${id} doesn't exists`);
    }

    return data[id];
  }

  public async createQuiz(quiz: QuizType): Promise<number> {
    while (this.isWriting) {
      await delay(10);
    }
    this.isWriting = true;

    // TODO: Final check before inserting

    const data = JSON.parse(
      await fs.readFile("../data/quiz.json", "utf-8"),
    ) as QuizType[];

    winstonLogger.info("Inserted a new quiz:", { quiz });

    data.push(quiz);

    await fs.writeFile("../data/quiz.json", JSON.stringify(data), "utf8");

    this.isWriting = false;
    return data.length - 1;
  }

  public async updateQuiz(
    id: number,
    updatedQuiz: QuizType,
  ): Promise<QuizType> {
    while (this.isWriting) {
      await delay(10);
    }
    this.isWriting = true;

    const data = JSON.parse(
      await fs.readFile("../data/quiz.json", "utf-8"),
    ) as QuizType[];

    if (data.length <= id || id < 0) {
      throw new Error(`Quiz with id: ${id} doesn't exists`);
    }

    const oldQuiz = data[id];

    winstonLogger.info("Updated a quiz: ", { id, oldQuiz, updatedQuiz });

    data[id] = updatedQuiz;

    await fs.writeFile("../data/quiz.json", JSON.stringify(data), "utf8");

    this.isWriting = false;
    return updatedQuiz;
  }

  public async deleteQuiz(id: number): Promise<void> {
    while (this.isWriting) {
      await delay(10);
    }
    this.isWriting = true;

    let data = JSON.parse(
      await fs.readFile("../data/quiz.json", "utf-8"),
    ) as QuizType[];

    if (data.length <= id || id < 0) {
      throw new Error(`Quiz with id: ${id} doesn't exists`);
    }

    data = data.filter((quiz, index) => {
      if (index === id) {
        winstonLogger.info("Deleting the quiz:", { quiz });
        return false;
      }

      return true;
    });

    await fs.writeFile("../data/quiz.json", JSON.stringify(data), "utf8");

    this.isWriting = false;
  }
}

export default new QuizModel();
