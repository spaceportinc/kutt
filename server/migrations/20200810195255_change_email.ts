import * as Knex from "knex";
import prefix from "../models/prefix";

export async function up(knex: Knex): Promise<any> {
  const hasChangeEmail = await knex.schema.hasColumn(
    prefix + "users",
    "change_email_token"
  );
  if (!hasChangeEmail) {
    await knex.schema.alterTable(prefix + "users", table => {
      table.dateTime("change_email_expires");
      table.string("change_email_token");
      table.string("change_email_address");
    });
  }
}

export async function down(): Promise<any> {
  return null;
}
