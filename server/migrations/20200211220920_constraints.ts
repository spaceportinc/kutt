import * as Knex from "knex";
import * as models from "../models";
import prefix from "../models/prefix";

export async function up(knex: Knex): Promise<any> {
  await models.createUserTable(knex);
  await models.createIPTable(knex);
  await models.createDomainTable(knex);
  await models.createHostTable(knex);
  await models.createLinkTable(knex);
  await models.createVisitTable(knex);

  await Promise.all([
    knex.raw(`
      ALTER TABLE ${prefix}domains
      DROP CONSTRAINT ${prefix}domains_user_id_foreign,
      ADD CONSTRAINT ${prefix}domains_user_id_foreign
        FOREIGN KEY (user_id)
        REFERENCES ${prefix}users (id)
        ON DELETE SET NULL;
    `),
    knex.raw(`
      ALTER TABLE ${prefix}links
      DROP CONSTRAINT ${prefix}links_user_id_foreign,
      ADD CONSTRAINT ${prefix}links_user_id_foreign
        FOREIGN KEY (user_id)
        REFERENCES ${prefix}users (id)
        ON DELETE CASCADE;
    `),
    knex.raw(`
      ALTER TABLE ${prefix}visits
      DROP CONSTRAINT ${prefix}visits_link_id_foreign,
      ADD CONSTRAINT ${prefix}visits_link_id_foreign
        FOREIGN KEY (link_Id)
        REFERENCES ${prefix}links (id)
        ON DELETE CASCADE;
    `)
  ]);
}

export async function down(knex: Knex): Promise<any> {
  // do nothing
}
