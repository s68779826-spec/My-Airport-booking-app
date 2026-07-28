import {findUserById} from "./auth";
import {verifyToken} from "./jwt";

export async function  getCurrentUser(req: Request) {
const authHeader = req.headers.get("authorization");
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return null;
}
const token = authHeader.split(" ")[1];
const payload =  verifyToken(token);
if (!payload) {
  return null;
}
const user = await findUserById(Number(payload.userId));
if (!user) {
  return null;
}
return user;   
}