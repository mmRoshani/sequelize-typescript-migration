/* eslint-disable import/extensions */
import { Sequelize } from 'sequelize-typescript'
import { join } from 'path'
import dotenv from 'dotenv'

import { SequelizeTypescriptMigration } from '../src'
import * as models from './db/models'

dotenv.config()

const bootstrap = async () => {
  const sequelize = new Sequelize(process.env.DB_URI as string, {
    models: Object.values(models)
  })

  try {
    const result = await SequelizeTypescriptMigration.makeMigration(sequelize, {
      outDir: join(__dirname, './db/migrations'),
      migrationName: 'init'
    })
    console.log(result)
  } catch (e) {
    console.log(e)
  }
}

bootstrap()
