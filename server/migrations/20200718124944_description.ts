import * as Knex from "knex";
import prefix from '../models/prefix';

export async function up(knex: Knex): Promise<any> {
  const hasDescription = await knex.schema.hasColumn(prefix+"links", "description");
  if (!hasDescription) {
    await knex.schema.alterTable(prefix+"links", table => {
      table.string("description");
    });
  }
}

export async function down(): Promise<any> {
  return null;
}
