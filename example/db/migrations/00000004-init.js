'use strict'

const Sequelize = require('sequelize')

/**
 * Actions summary:
 *
 * dropTable "Cars"
 * dropTable "CarBrands"
 * createTable "car_brands", deps: []
 * createTable "cars", deps: [car_brands]
 *
 **/

const info = {
  revision: 4,
  name: 'init',
  created: '2022-07-31T06:02:20.150Z',
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
            '{"revision":4,"tables":{"cars":{"tableName":"cars","schema":{"id":{"seqType":"Sequelize.INTEGER","allowNull":false,"primaryKey":true,"autoIncrement":true},"name":{"seqType":"Sequelize.STRING"},"carBrandId":{"seqType":"Sequelize.INTEGER","allowNull":true,"references":{"model":"car_brands","key":"id"},"onUpdate":"CASCADE","onDelete":"NO ACTION"},"createdAt":{"seqType":"Sequelize.DATE","allowNull":false},"updatedAt":{"seqType":"Sequelize.DATE","allowNull":false},"deletedAt":{"seqType":"Sequelize.DATE"}},"indexes":{}},"car_brands":{"tableName":"car_brands","schema":{"id":{"seqType":"Sequelize.INTEGER","allowNull":false,"primaryKey":true,"autoIncrement":true},"name":{"seqType":"Sequelize.STRING"},"isCertified":{"seqType":"Sequelize.BOOLEAN"},"imgUrl":{"seqType":"Sequelize.STRING"},"orderNo":{"seqType":"Sequelize.INTEGER"},"carsCount":{"seqType":"Sequelize.INTEGER"},"createdAt":{"seqType":"Sequelize.DATE","allowNull":false},"updatedAt":{"seqType":"Sequelize.DATE","allowNull":false},"deletedAt":{"seqType":"Sequelize.DATE"}},"indexes":{}}}}'
        }
      ],
      {}
    ]
  },
  {
    fn: 'dropTable',
    params: ['Cars']
  },
  {
    fn: 'dropTable',
    params: ['CarBrands']
  },

  {
    fn: 'createTable',
    params: [
      'car_brands',
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        isCertified: {
          type: Sequelize.BOOLEAN
        },
        imgUrl: {
          type: Sequelize.STRING
        },
        orderNo: {
          type: Sequelize.INTEGER
        },
        carsCount: {
          type: Sequelize.INTEGER
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deletedAt: {
          type: Sequelize.DATE
        }
      },
      {}
    ]
  },

  {
    fn: 'createTable',
    params: [
      'cars',
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        carBrandId: {
          onDelete: 'NO ACTION',
          onUpdate: 'CASCADE',
          references: {
            model: 'car_brands',
            key: 'id'
          },
          allowNull: true,
          type: Sequelize.INTEGER
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deletedAt: {
          type: Sequelize.DATE
        }
      },
      {}
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
    fn: 'dropTable',
    params: ['cars']
  },
  {
    fn: 'dropTable',
    params: ['car_brands']
  },

  {
    fn: 'createTable',
    params: [
      'CarBrands',
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        isCertified: {
          type: Sequelize.BOOLEAN
        },
        imgUrl: {
          type: Sequelize.STRING
        },
        orderNo: {
          type: Sequelize.INTEGER
        },
        carsCount: {
          type: Sequelize.INTEGER
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      {}
    ]
  },

  {
    fn: 'createTable',
    params: [
      'Cars',
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        carBrandId: {
          onDelete: 'NO ACTION',
          onUpdate: 'CASCADE',
          references: {
            model: 'CarBrands',
            key: 'id'
          },
          allowNull: true,
          type: Sequelize.INTEGER
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
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
