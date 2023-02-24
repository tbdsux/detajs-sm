import { usersBase } from "./util";

async function updateUser() {
  await usersBase.put({ name: "user5", key: "5" });

  await usersBase.update({ age: 15 }, "5");
  await usersBase.update({ age: usersBase.util.increment() }, "5");

  const user = await usersBase.get("5");
  console.log(user);
}

updateUser();
