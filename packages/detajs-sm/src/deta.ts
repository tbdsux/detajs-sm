import { _Base } from "./base";

class _Deta {
  projectKey: string;

  constructor(projectKey?: string) {
    const _projectKey = projectKey ? projectKey : process.env.DETA_PROJECT_KEY;
    if (_projectKey === undefined)
      throw new Error(
        "DETA_PROJECT_KEY is not defined. Please pass a projectKey or set DETA_PROJECT_KEY env variable."
      );

    this.projectKey = _projectKey;
  }

  Base(name: string) {
    return new _Base(name, this.projectKey);
  }
}

const Deta = (projectKey?: string) => {
  return new _Deta(projectKey);
};

export { Deta, _Deta };
