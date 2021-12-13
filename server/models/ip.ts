import * as Knex from "knex";
import prefix from './prefix';

export async function createIPTable(knex: Knex) {
  const hasTable = await knex.schema.hasTable(prefix+"ips");
  if (!hasTable) {
    await knex.schema.createTable(prefix+"ips", table => {
      table.increments("id").primary();
      table
        .string("ip")
        .unique()
        .notNullable();
      table.timestamps(false, true);
    });
  }
}
