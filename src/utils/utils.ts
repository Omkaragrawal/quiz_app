import { DateTime } from "luxon";
import { customAlphabet } from "nanoid";
import { setTimeout } from "node:timers/promises";

export default class UTILS {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static isEmptyObject(object: Record<string, any>): boolean {
    return !Object.values(object).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (value && value.constructor === Object) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return Object.keys(value).length > 0;
      }
      return value !== undefined && value !== null && value !== "";
    });
  }

  public getRandomNumber(length: number): number {
    return Number(`${customAlphabet("0123456789", length)()}`);
  }

  public get getRandomId(): number {
    return Number(`${DateTime.now().toMillis()}${this.getRandomNumber(4)}`);
  }

  public static checkIfProduction(): boolean {
    return Boolean(process.env.NODE_ENV === "production") || false;
  }
}

export const delay = setTimeout;

export const utilsInstance = new UTILS();
