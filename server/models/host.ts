import * as Knex from "knex";
import prefix from "./prefix";

export async function createHostTable(knex: Knex) {
  const hasTable = await knex.schema.hasTable(prefix + "hosts");
  if (!hasTable) {
    await knex.schema.createTable(prefix + "hosts", table => {
      table.increments("id").primary();
      table
        .string("address")
        .unique()
        .notNullable();
      table
        .boolean("banned")
        .notNullable()
        .defaultTo(false);
      table
        .integer("banned_by_id")
        .references("id")
        .inTable(prefix + "users");
      table.timestamps(false, true);
    });
  }
}
