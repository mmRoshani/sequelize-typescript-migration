import { Sequelize } from 'sequelize-typescript'
import { QueryTypes } from 'sequelize'

import {
  SequelizeMigrations,
  SequelizeMigrationsMeta,
  MigrationState
} from './constants'

export default async function getLastMigrationState(
  sequelize: Sequelize
): Promise<MigrationState | undefined> {
  const [lastExecutedMigration] = await sequelize.query<SequelizeMigrations>(
    'SELECT name FROM "SequelizeMeta" ORDER BY name desc limit 1',
    { type: QueryTypes.SELECT }
  )

  const lastRevision: number =
    lastExecutedMigration !== undefined
      ? parseInt(lastExecutedMigration.name.split('-')[0])
      : -1

  const [lastMigration] = await sequelize.query<SequelizeMigrationsMeta>(
    `SELECT state FROM "SequelizeMigrationsMeta" where revision = '${lastRevision}'`,
    { type: QueryTypes.SELECT }
  )

  if (lastMigration)
    return typeof lastMigration.state === 'string'
      ? (JSON.parse(lastMigration.state) as MigrationState)
      : lastMigration.state
}
