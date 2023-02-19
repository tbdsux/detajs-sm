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

  increment(value: number) {
    return new BaseAction(BaseUtilsActions.Increment, value);
  }

  append<T>(values: T | T[]) {
    return new BaseAction(BaseUtilsActions.Append, values);
  }

  prepend<T>(values: T | T[]) {
    return new BaseAction(BaseUtilsActions.Prepend, values);
  }
}

export { BaseUtils, BaseUtilsActions, BaseAction };
