# detajs-sm

Small Deta Base wrapper with Typescript support.

### What's different?

This library / package aims to focus more on json object types, so mostly `put` functions will need a json object and won't accept other types.
Support for custom generic types especially in `get` / fetching is also the goal.

## Install

## Usage

Usage is similar with the official [Javascript SDK](https://github.com/deta/deta-javascript)

```ts
import Deta from "detajs-sm";

export interface User {
  name: string;
}

export interface IUser extends User {
  key: string;
}

const deta = Deta();
const users = deta.Base("users");

const u: User = {
  name: "random",
};

const userKey = await users.put(u);
console.log(userKey);
```

##

**&copy; 2023 | tbdsux**
