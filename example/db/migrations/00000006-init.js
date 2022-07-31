'use strict'

const Sequelize = require('sequelize')

/**
 * Actions summary:
 *
 * addColumn "year" to table "cars"
 *
 **/

const info = {
  revision: 6,
  name: 'init',
  created: '2022-07-31T06:12:43.962Z',
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
            '{"revision":6,"tables":{"cars":{"tableName":"cars","schema":{"id":{"seqType":"Sequelize.INTEGER","allowNull":false,"primaryKey":true,"autoIncrement":true},"name":{"seqType":"Sequelize.STRING"},"carBrandId":{"seqType":"Sequelize.INTEGER","allowNull":true,"references":{"model":"car_brands","key":"id"},"onUpdate":"CASCADE","onDelete":"NO ACTION"},"year":{"seqType":"Sequelize.INTEGER"},"createdAt":{"seqType":"Sequelize.DATE","allowNull":false},"updatedAt":{"seqType":"Sequelize.DATE","allowNull":false},"deletedAt":{"seqType":"Sequelize.DATE"}},"indexes":{}},"car_brands":{"tableName":"car_brands","schema":{"id":{"seqType":"Sequelize.INTEGER","allowNull":false,"primaryKey":true,"autoIncrement":true},"name":{"seqType":"Sequelize.STRING"},"isCertified":{"seqType":"Sequelize.BOOLEAN"},"imgUrl":{"seqType":"Sequelize.STRING"},"carsCount":{"seqType":"Sequelize.INTEGER"},"createdAt":{"seqType":"Sequelize.DATE","allowNull":false},"updatedAt":{"seqType":"Sequelize.DATE","allowNull":false},"deletedAt":{"seqType":"Sequelize.DATE"}},"indexes":{}}}}'
        }
      ],
      {}
    ]
  },
  {
    fn: 'addColumn',
    params: [
      'cars',
      'year',
      {
        type: Sequelize.INTEGER
      }
    ]
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
    fn: 'removeColumn',
    params: ['cars', 'year']
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
