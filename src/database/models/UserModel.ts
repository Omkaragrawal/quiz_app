import { fileURLToPath } from "node:url";
import path from "node:path";

import { type UserType } from "types";
import BaseModel from "./BaseModel";

class UserModel extends BaseModel<UserType> {
  protected override isWriting = false;

  protected override filePath = fileURLToPath(
    import.meta.resolve(
      path.join("..", "data", "user.json"),
      import.meta.dirname,
    ),
  );

  protected override modelName = "User";
}

export default new UserModel();
