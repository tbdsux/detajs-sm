import { _Base } from "./base";
import { BaseDataProps } from "./types";

class _Deta {
  projectKey: string;
  projectId: string;

  constructor(projectKey?: string) {
    const _projectKey = projectKey ? projectKey : process.env.DETA_PROJECT_KEY;
    if (_projectKey === undefined)
      throw new Error(
        "DETA_PROJECT_KEY is not defined. Please pass a projectKey or set DETA_PROJECT_KEY env variable."
      );

    const v = _projectKey.split("_");
    if (v.length != 2) {
      throw new Error("Invalid project key.");
    }

    this.projectId = v[0];
    this.projectKey = _projectKey;
  }

  Base<K extends BaseDataProps = BaseDataProps>(name: string) {
    return new _Base<K>(name, this.projectKey, this.projectId);
  }
}

const Deta = (projectKey?: string) => {
  return new _Deta(projectKey);
};

export { Deta, _Deta };
