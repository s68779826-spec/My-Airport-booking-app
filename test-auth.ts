import { hashPassword, comparePassword } from "./app/lib/hash";

async function test() {
  const password = "123456";

  const hash = await hashPassword(password);

  console.log("Hash:", hash);

  const result = await comparePassword(password, hash);

  console.log("Password matches?", result);
}

test();