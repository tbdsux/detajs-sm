import { Deta } from "detajs-sm";

export interface User {
  name: string;
}

export interface IUser extends User {
  key: string;
}

const deta = Deta();
const users = deta.Base("users");

async function fetch() {
  const f = await users.fetch();

  console.log(f);
}
fetch();

async function update() {
  const userKey = "lii5ld9muw1d";
  const up = await users.update(
    {
      name: "new name",
    },
    userKey
  );

  console.log(up);
}
update();

async function _delete() {
  const key = "da2yt4pbw16w";

  await users.delete(key);
}
_delete();

async function get() {
  const userKey = "lii5ld9muw1d";

  const user = await users.get<IUser>(userKey);

  console.log(user);
}
get();

async function put() {
  const u: User = {
    name: "random",
  };

  const userKey = await users.put(u);
  console.log(userKey);
}
put();
