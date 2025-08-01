import { delay } from "#utils/utils";
import fs from "fs/promises";
import { winstonLogger } from "server_middleware";

abstract class BaseModel<ModelType> {
  protected isWriting = false;

  protected filePath = "../data/base.json";

  protected modelName = "Base";

  public async getAll(): Promise<ModelType[]> {
    while (this.isWriting) {
      await delay(10);
    }

    winstonLogger.info(`fetching all data for ${this.modelName}`);

    return JSON.parse(await fs.readFile(this.filePath, "utf8")) as ModelType[];
  }

  public async findById(id: number): Promise<ModelType> {
    while (this.isWriting) {
      await delay(10);
    }

    if (Number.isNaN(id)) {
      throw new Error(`Invalid ${this.modelName} id`);
    }

    const data = JSON.parse(
      await fs.readFile(this.filePath, "utf-8"),
    ) as ModelType[];

    if (data.length <= id || id < 0) {
      throw new Error(`${this.modelName} with id: ${id} doesn't exists`);
    }

    winstonLogger.info(`Fetching data for ${this.modelName} with id: ${id}`);

    return data[id];
  }

  public async create(model: ModelType): Promise<number> {
    while (this.isWriting) {
      await delay(10);
    }
    this.isWriting = true;

    const data = JSON.parse(
      await fs.readFile(this.filePath, "utf-8"),
    ) as ModelType[];

    winstonLogger.info(`Inserted a new ${this.modelName}:`, {
      [this.modelName]: model,
    });

    data.push(model);

    await fs.writeFile(this.filePath, JSON.stringify(data), "utf8");

    this.isWriting = false;
    return data.length - 1;
  }

  public async update(
    id: number,
    updatedModel: ModelType,
  ): Promise<{ old: ModelType; new: ModelType }> {
    while (this.isWriting) {
      await delay(10);
    }
    this.isWriting = true;

    const data = JSON.parse(
      await fs.readFile(this.filePath, "utf-8"),
    ) as ModelType[];

    if (data.length <= id || id < 0) {
      throw new Error(`${this.modelName} with id: ${id} doesn't exists`);
    }

    const oldModel = data[id];

    winstonLogger.info(`Updated a ${this.modelName}: `, {
      id,
      oldModel,
      updatedModel,
    });

    data[id] = updatedModel;

    await fs.writeFile(this.filePath, JSON.stringify(data), "utf8");

    this.isWriting = false;
    return { old: oldModel, new: { id, data: updatedModel } as ModelType };
  }

  public async delete(id: number): Promise<void> {
    while (this.isWriting) {
      await delay(10);
    }
    this.isWriting = true;

    let data = JSON.parse(
      await fs.readFile(this.filePath, "utf-8"),
    ) as ModelType[];

    if (data.length <= id || id < 0) {
      throw new Error(`${this.modelName} with id: ${id} doesn't exists`);
    }

    data = data.filter((model, index) => {
      if (index === id) {
        winstonLogger.info(`Deleting the ${this.modelName}:`, {
          [this.modelName]: model,
        });
        return false;
      }

      return true;
    });

    await fs.writeFile(this.filePath, JSON.stringify(data), "utf8");

    this.isWriting = false;
  }
}

export default BaseModel;
