import * as Knex from "knex";
import prefix from "../models/prefix";
import bcrypt from "bcryptjs";
import env from "../env";

export async function up(knex: Knex): Promise<any> {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(env.ADMIN_PASSWORD, salt);
  const data = {
    email: env.ADMIN_EMAIL,
    password: password,
    verified: true,
    apikey: env.ADMIN_APIKEY
  };
  await knex(prefix + "users").insert(data);
}

export async function down(): Promise<any> {
  return null;
}
