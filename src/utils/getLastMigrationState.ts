import { QueryTypes } from "sequelize";
import type { Sequelize } from "sequelize-typescript";

import type {
  MigrationState,
  SequelizeMigrations,
  SequelizeMigrationsMeta,
} from "../constants";

export default async function getLastMigrationState(sequelize: Sequelize) {
  if (sequelize.getDialect() == 'mysql') {
    await sequelize.query('SET SESSION SQL_MODE=ANSI_QUOTES;', { type: QueryTypes.RAW });
  }

  const [lastExecutedMigration] = await sequelize.query<SequelizeMigrations>(
    'SELECT name FROM "SequelizeMeta" ORDER BY name desc limit 1',
    { type: QueryTypes.SELECT }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lastRevision: number =
    lastExecutedMigration !== undefined
      ? parseInt(lastExecutedMigration.name.split("-")[0])
      : -1;

  const [lastMigration] = await sequelize.query<SequelizeMigrationsMeta>(
    `SELECT state FROM "SequelizeMigrationsMeta" where revision = '${lastRevision}'`,
    { type: QueryTypes.SELECT }
  );

  if (lastMigration)
    return typeof lastMigration.state === "string"
      ? (JSON.parse(lastMigration.state) as MigrationState)
      : lastMigration.state;
}
