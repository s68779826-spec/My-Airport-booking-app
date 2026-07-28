import { UserWithRole } from "./auth";

export function requireAdmin(user: UserWithRole | null) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role.name !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
}