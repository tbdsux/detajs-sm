import { usersBase } from "./util";

async function putUser() {
  const u = await usersBase.put({ name: "user1", key: "1" });
  console.log(u);
}

async function putManyUser() {
  const users = await usersBase.putMany([
    { name: "user2", key: "2" },
    { name: "user3", key: "3" },
  ]);
  for (const i of users.processed.items) {
    console.log(i);
  }
}

putUser();
putManyUser();
