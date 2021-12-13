import * as Knex from "knex";
import prefix from '../models/prefix';

export async function up(knex: Knex): Promise<any> {
  const hasExpireIn = await knex.schema.hasColumn(prefix+"links", "expire_in");
  if (!hasExpireIn) {
    await knex.schema.alterTable(prefix+"links", table => {
      table.dateTime("expire_in");
    });
  }
}

export async function down(): Promise<any> {
  return null;
}
