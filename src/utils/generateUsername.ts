import { randomUUID } from "crypto";
import slugify from "slugify";

/** This is to crate a username for users who don't have a username
 * The slugify removes whitespace
 */
export const generateUsername = (name: string) => slugify(name) + randomUUID();