import { usersBase } from "./util";

async function insertUser() {
  const us = await usersBase.insert({ name: "random", key: "asd" });
  console.log(us);
}

async function deleteUser() {
  const userKey = "asd";
  const d = await usersBase.delete(userKey);
  console.log(d);
}

async function main() {
  await insertUser();
  await deleteUser();
}
main();
