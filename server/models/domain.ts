import * as Knex from "knex";
import prefix from './prefix';

export async function createDomainTable(knex: Knex) {
  const hasTable = await knex.schema.hasTable(prefix+"domains");
  if (!hasTable) {
    await knex.schema.raw('create extension if not exists "uuid-ossp"');
    await knex.schema.createTable(prefix+"domains", table => {
      table.increments("id").primary();
      table
        .boolean("banned")
        .notNullable()
        .defaultTo(false);
      table
        .integer("banned_by_id")
        .references("id")
        .inTable(prefix+"users");
      table
        .string("address")
        .unique()
        .notNullable();
      table.string("homepage").nullable();
      table
        .integer("user_id")
        .references("id")
        .inTable(prefix+"users")
        .onDelete("SET NULL");
      table
        .uuid("uuid")
        .notNullable()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.timestamps(false, true);
    });
  }
}
