import { type QuizType } from "types";
import BaseModel from "./BaseModel";

class UserModel extends BaseModel<QuizType> {
  protected override isWriting = false;

  protected override filePath = "../data/user.json";

  protected override modelName = "User";
}

export default new UserModel();
