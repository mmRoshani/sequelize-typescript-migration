import { diff } from 'deep-diff'

import { Table, Tables, TableSchema } from './constants'
import sortActions from './sortActions'

export interface IAction {
  actionType:
    | 'createTable'
    | 'addIndex'
    | 'addColumn'
    | 'dropTable'
    | 'removeColumn'
    | 'removeIndex'
    | 'changeColumn'
  tableName: string
  attributes?: TableSchema
  attributeName?: string
  options?: any
  columnName?: string
  fields?: any[]
  depends: string[]
}

export default function getDiffActionsFromTables(
  previousStateTables: Tables,
  currentStateTables: Tables
) {
  const actions: IAction[] = []
  const differences = diff(previousStateTables, currentStateTables)

  if (!differences) return actions

  differences.forEach(df => {
    if (!df.path) throw new Error('Missing path')

    switch (df.kind) {
      // add new
      case 'N':
        {
          const rhs = df.rhs as unknown as Table
          const paths = df.path as string[]

          // new table created
          if (paths.length === 1) {
            const depends: string[] = []
            const { tableName } = rhs

            Object.values(rhs.schema).forEach(v => {
              if (
                v.references &&
                typeof v.references !== 'string' &&
                typeof v.references.model === 'string'
              )
                depends.push(v.references.model)
            })

            actions.push({
              actionType: 'createTable',
              tableName,
              attributes: rhs.schema,
              options: {},
              depends
            })

            // create indexes
            if (rhs.indexes)
              for (const i in rhs.indexes) {
                const copied = JSON.parse(JSON.stringify(rhs.indexes[i]))

                actions.push(
                  Object.assign(
                    {
                      actionType: 'addIndex',
                      tableName,
                      depends: [tableName]
                    },
                    copied
                  )
                )
              }

            break
          }

          const tableName = paths[0]
          const depends = [tableName]

          if (paths[1] === 'schema') {
            // new field
            if (paths.length === 3) {
              // this should never happen
              // if (rhs && rhs.references) depends.push(rhs.references.model)

              actions.push({
                actionType: 'addColumn',
                tableName,
                attributeName: paths[2],
                options: rhs,
                depends
              })

              break
            }

            //  add new attribute to column (change col)
            if (paths.length > 3)
              if (paths[1] === 'schema') {
                // new field attributes
                const options = currentStateTables[tableName].schema[paths[2]]

                if (
                  options.references &&
                  typeof options.references !== 'string' &&
                  typeof options.references.model === 'string'
                )
                  depends.push(options.references.model)

                actions.push({
                  actionType: 'changeColumn',
                  tableName,
                  attributeName: df.path[2],
                  options,
                  depends
                })

                break
              }
          }

          // new index
          if (paths[1] === 'indexes' && rhs) {
            const tableName = paths[0]
            const copied = rhs ? JSON.parse(JSON.stringify(rhs)) : undefined
            const index = copied

            index.actionType = 'addIndex'
            index.tableName = tableName
            index.depends = [tableName]
            actions.push(index)

            break
          }
        }

        break

      // drop
      case 'D':
        {
          // This types are not correct in case a column is deleted, but in fact it does not matter
          const lhs = df.lhs as unknown as Table & {
            fields: any
            options: any
          }
          const paths = df.path as string[]
          const tableName = paths[0]

          if (paths.length === 1) {
            // drop table
            const depends: string[] = []

            Object.values(lhs.schema).forEach(v => {
              if (
                typeof v !== 'string' &&
                v.references &&
                typeof v.references !== 'string' &&
                typeof v.references.model === 'string'
              )
                depends.push(v.references.model)
            })

            actions.push({
              actionType: 'dropTable',
              tableName,
              depends
            })

            break
          }

          if (paths[1] === 'schema') {
            // drop field
            if (paths.length === 3) {
              // drop column
              actions.push({
                actionType: 'removeColumn',
                tableName,
                columnName: paths[2],
                depends: [tableName]
              })

              break
            }

            // drop attribute from column (change col)
            if (paths.length > 3) {
              const depends = [tableName]
              // new field attributes
              const options = currentStateTables[tableName].schema[paths[2]]

              if (
                options.references &&
                typeof options.references !== 'string' &&
                typeof options.references.model === 'string'
              )
                depends.push(options.references.model)

              actions.push({
                actionType: 'changeColumn',
                tableName,
                attributeName: paths[2],
                options,
                depends
              })

              break
            }
          }

          if (paths[1] === 'indexes' && lhs) {
            actions.push({
              actionType: 'removeIndex',
              tableName,
              fields: lhs.fields,
              options: lhs.options,
              depends: [tableName]
            })

            break
          }
        }

        break

      // edit
      case 'E':
        {
          const paths = df.path as string[]
          const tableName = paths[0]
          const depends = [tableName]

          if (paths[1] === 'schema') {
            // new field attributes
            const options = currentStateTables[tableName].schema[paths[2]]

            if (
              options.references &&
              typeof options.references !== 'string' &&
              typeof options.references.model === 'string'
            )
              depends.push(options.references.model)

            actions.push({
              actionType: 'changeColumn',
              tableName,
              attributeName: paths[2],
              options,
              depends
            })
          }
        }

        break

      // array change indexes
      case 'A':
        console.log(
          '[Not supported] Array model changes! Problems are possible. Please, check result more carefully!'
        )
        console.log('[Not supported] Difference: ')
        console.log(JSON.stringify(df, null, 4))

        break

      default:
        // code
        break
    }
  })

  const result = sortActions(actions)

  return result
}
