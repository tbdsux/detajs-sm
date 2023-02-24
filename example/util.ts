import { Deta } from "detajs-sm";

export interface User {
  name: string;
  key: string;
}

const deta = Deta();
const usersBase = deta.Base<User>("allUser");

export { usersBase };
