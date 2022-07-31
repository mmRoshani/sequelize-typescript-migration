'use strict'

const Sequelize = require('sequelize')

/**
 * Actions summary:
 *
 * dropTable "users"
 *
 **/

const info = {
  revision: 3,
  name: 'init',
  created: '2022-07-31T05:52:20.502Z',
  comment: ''
}

const migrationCommands = [
  {
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
            '{"revision":3,"tables":{"Cars":{"tableName":"Cars","schema":{"id":{"seqType":"Sequelize.INTEGER","allowNull":false,"primaryKey":true,"autoIncrement":true},"name":{"seqType":"Sequelize.STRING"},"carBrandId":{"seqType":"Sequelize.INTEGER","allowNull":true,"references":{"model":"CarBrands","key":"id"},"onUpdate":"CASCADE","onDelete":"NO ACTION"},"createdAt":{"seqType":"Sequelize.DATE","allowNull":false},"updatedAt":{"seqType":"Sequelize.DATE","allowNull":false}},"indexes":{}},"CarBrands":{"tableName":"CarBrands","schema":{"id":{"seqType":"Sequelize.INTEGER","allowNull":false,"primaryKey":true,"autoIncrement":true},"name":{"seqType":"Sequelize.STRING"},"isCertified":{"seqType":"Sequelize.BOOLEAN"},"imgUrl":{"seqType":"Sequelize.STRING"},"orderNo":{"seqType":"Sequelize.INTEGER"},"carsCount":{"seqType":"Sequelize.INTEGER"},"createdAt":{"seqType":"Sequelize.DATE","allowNull":false},"updatedAt":{"seqType":"Sequelize.DATE","allowNull":false}},"indexes":{}}}}'
        }
      ],
      {}
    ]
  },
  {
    fn: 'dropTable',
    params: ['users']
  }
]

const rollbackCommands = [
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
    fn: 'createTable',
    params: [
      'users',
      {
        id:
        {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER
        },
        name:
        {
          type: Sequelize.STRING
        },
        createdAt:
        {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt:
        {
          allowNull: false,
          type: Sequelize.DATE
        },
        deletedAt:
        {
          type: Sequelize.DATE
        }
      },
      {}
    ]
  }
]

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
