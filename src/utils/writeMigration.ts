import beautify from 'js-beautify'
import { writeFileSync } from 'fs'
import { join } from 'path'
import removeCurrentRevisionMigrations from './removeCurrentRevisionMigrations'
import { MigrationState } from './constants'

export default async function writeMigration(
  currentState: MigrationState,
  migration,
  options
) {
  await removeCurrentRevisionMigrations(
    currentState.revision,
    options.outDir,
    options
  )

  const name = options.migrationName || 'noname'
  const comment = options.comment || ''

  let myState = JSON.stringify(currentState)
  const searchRegExp = /'/g
  const replaceWith = "\\'"

  myState = myState.replace(searchRegExp, replaceWith)

  const versionCommands = `{
    fn: 'createTable',
    params: [
      'SequelizeMigrationsMeta',
      {
        revision: {
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING
        },
        state: {
          allowNull: false,
          type: Sequelize.JSON
        }
      },
      {}
    ]
  },
  {
    fn: 'bulkDelete',
    params: [
      'SequelizeMigrationsMeta',
      [
        {
          revision: info.revision
        }
      ],
      {}
    ]
  },
  {
    fn: 'bulkInsert',
    params: [
      'SequelizeMigrationsMeta',
      [
        {
          revision: info.revision,
          name: info.name,
          state:
            '${myState}'
        }
      ],
      {}
    ]
  },
`
  const versionDownCommands = `{
    fn: 'bulkDelete',
    params: [
      'SequelizeMigrationsMeta',
      [
        {
          revision: info.revision
        }
      ],
      {}
    ]
  },`

  const commands = `const migrationCommands = [
  ${versionCommands}${beautify(
    migration.commandsUp
      .join(', \n')
      .replace(/"([^"]+)":/g, '$1:')
      .replaceAll('"', "'"),
    { indent_size: 2, indent_level: 1 }
  )}\n]`

  const commandsDown = `const rollbackCommands = [
  ${versionDownCommands}\n${beautify(
    migration.commandsDown
      .join(', \n')
      .replace(/"([^"]+)":/g, '$1:')
      .replaceAll('"', "'"),
    { indent_size: 2, indent_level: 1, brace_style: 'expand' }
  )}\n]`

  const actions = ` * ${migration.consoleOut.join('\n * ')}`

  const info = {
    revision: currentState.revision,
    name,
    created: new Date(),
    comment
  }

  const template = `'use strict'

const Sequelize = require('sequelize')

/**
 * Actions summary:
 *
${actions}
 *
 **/

const info = ${JSON.stringify(info, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replaceAll('"', "'")}

${commands}

${commandsDown}

module.exports = {
  pos: 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  up(queryInterface, Sequelize) {
    let index = this.pos

    return new Promise(function (resolve, reject) {
      function next() {
        if (index < migrationCommands.length) {
          const command = migrationCommands[index]

          console.log('[#' + index + '] execute: ' + command.fn)
          index++
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject)
        } else resolve()
      }

      next()
    })
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  down(queryInterface, Sequelize) {
    let index = this.pos

    return new Promise(function (resolve, reject) {
      function next() {
        if (index < rollbackCommands.length) {
          const command = rollbackCommands[index]

          console.log('[#' + index + '] execute: ' + command.fn)
          index++
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject)
        } else resolve()
      }

      next()
    })
  },
  info
}
`

  const revisionNumber = currentState.revision?.toString().padStart(8, '0')
  const filename = join(
    options.outDir,
    `${
      revisionNumber + (name !== '' ? `-${name.replace(/[\s-]/g, '_')}` : '')
    }.js`
  )

  writeFileSync(filename, template)

  return { filename, info, revisionNumber }
}
