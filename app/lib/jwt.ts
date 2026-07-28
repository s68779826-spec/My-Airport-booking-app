import jwt from "jsonwebtoken";

export type TokenPayload = {
  userId: string;
  email: string;
  role: string;
 
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  console.log("JWT Secret:", secret);

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch (error) {
    console.error("JWT Verify Error:", error);
    return null;
  }
}