enum BaseUtilsActions {
  Set,
  Increment,
  Append,
  Prepend,
  Delete,
}

class BaseAction<T = any> {
  action: BaseUtilsActions;
  value?: T;

  constructor(action: BaseUtilsActions, value?: T) {
    this.action = action;
    this.value = value;
  }
}

class BaseUtils {
  trim() {
    return new BaseAction(BaseUtilsActions.Delete);
  }

  increment(value: number = 1) {
    return new BaseAction(BaseUtilsActions.Increment, value);
  }

  append<T>(values: T | T[]) {
    return new BaseAction(BaseUtilsActions.Append, values);
  }

  prepend<T>(values: T | T[]) {
    return new BaseAction(BaseUtilsActions.Prepend, values);
  }
}

// ==== https://github.com/deta/deta-javascript/blob/main/src/utils/date.ts
export class Day {
  private date: Date;

  /**
   * Day constructor
   *
   * @param {Date} [date]
   */
  constructor(date?: Date) {
    this.date = date || new Date();
  }

  /**
   * addSeconds returns new Day object
   * by adding provided number of seconds.
   *
   * @param {number} seconds
   * @returns {Day}
   */
  public addSeconds(seconds: number): Day {
    this.date = new Date(this.date.getTime() + 1000 * seconds);
    return this;
  }

  /**
   * getEpochSeconds returns number of seconds after epoch.
   *
   * @returns {number}
   */
  public getEpochSeconds(): number {
    return Math.floor(this.date.getTime() / 1000.0);
  }
}

// ====  https://github.com/deta/deta-javascript/blob/main/src/base/utils.ts#L31-#L78
export interface TTLResponse {
  ttl?: number;
  error?: Error;
}

/**
 * getTTL computes and returns ttl value based on expireIn and expireAt params.
 * expireIn and expireAt are optional params.
 *
 * @param {number} [expireIn]
 * @param {Date | number} [expireAt]
 * @returns {TTLResponse}
 */
export function getTTL(
  expireIn?: number,
  expireAt?: Date | number
): TTLResponse {
  // NOTE: `var == undefined` is same with `var == null`
  if (expireIn == null && expireAt == null) {
    return {};
  }

  if (expireIn != null && expireAt != null) {
    return { error: new Error("can't set both expireIn and expireAt options") };
  }

  if (expireIn) {
    if (!(typeof expireIn === "number")) {
      return {
        error: new Error("option expireIn should have a value of type number"),
      };
    }
    return { ttl: new Day().addSeconds(expireIn as number).getEpochSeconds() };
  }

  if (!(typeof expireAt === "number" || expireAt instanceof Date)) {
    return {
      error: new Error(
        "option expireAt should have a value of type number or Date"
      ),
    };
  }

  if (expireAt instanceof Date) {
    return { ttl: new Day(expireAt).getEpochSeconds() };
  }

  return { ttl: expireAt as number };
}

export { BaseUtils, BaseUtilsActions, BaseAction };
