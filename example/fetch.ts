import { usersBase } from "./util";

async function getUser() {
  const u = await usersBase.get("1");
  console.log(`user1: ${u?.name}`);
}

async function fetchUsers() {
  let { items: users, last } = await usersBase.fetch({}, { limit: 2 });
  while (last) {
    const { items, last: newLast } = await usersBase.fetch(
      {},
      { limit: 2, last: last }
    );

    last = newLast;

    users = [...users, ...items];
  }

  for (const i of users) {
    console.log(i);
  }
}

getUser();
fetchUsers();
