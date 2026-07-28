import { generateToken,verifyToken  } from "./app/lib/jwt";
import "dotenv/config";

const token= generateToken( {
  
userId: "123",
  email: "user@example.com",
    role: "user",
});
  console.log("GeneratedToken:");
  console.log(token);

  const decoded = verifyToken(token);
  console.log("Decoded Token:");
  console.log(decoded);
