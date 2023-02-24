# detajs-sm

Small Deta Base wrapper with Typescript support.

### What's different?

This library / package aims to focus more on json object types, so most functions will implement the type defined when initiating a base.

## Install

```sh
# npm
npm install detajs-sm

# yarn
yarn add detajs-sm

# pnpm
pnpm add detajs-sm
```

## Usage

Usage is similar with the official [Javascript SDK](https://github.com/deta/deta-javascript)

```ts
import { Deta } from "detajs-sm";

export interface User {
  name: string;
  key: string; // needs to be set
}

const deta = Deta();
const usersBase = deta.Base<User>("allUsers");

const userKey = await users.put({
  name: "user",
});
console.log(userKey);
```

##

**&copy; 2023 | tbdsux**
