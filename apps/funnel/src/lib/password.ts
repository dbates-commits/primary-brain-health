import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing via Node's built-in scrypt — no extra dependency and runs in
 * the Node.js runtime (Server Actions). The stored format is self-describing
 * (`scrypt$<salt>$<hash>`) so we can migrate to argon2/bcrypt later without a
 * data migration (see database-plan.md "Open decisions"). Not edge-compatible.
 */
const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const hashBuf = Buffer.from(hash, "hex");
  return (
    hashBuf.length === derived.length && timingSafeEqual(hashBuf, derived)
  );
}
