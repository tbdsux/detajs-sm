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

async function putWithOptions() {
  const expiringUser: User = {
    name: "expiring user",
  };

  const userKey = await users.put(expiringUser, undefined, { expireIn: 300 });
  console.log(userKey);
}
putWithOptions();

async function putMany() {
  const u1: User = {
    name: "user 1",
  };
  const u2: User = {
    name: "user 2",
  };

  const response = await users.putMany([u1, u2]);
  console.log(response);
}
putMany();
