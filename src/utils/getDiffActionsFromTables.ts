import { diff } from 'deep-diff'

import { Table, Tables } from './constants'
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
  attributes?: any
  attributeName?: any
  options?: any
  columnName?: any
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
          console.log(
            '🚀 ~ file: getDiffActionsFromTables.ts ~ line 41 ~ df',
            df
          )

          // new table created
          if (df.path.length === 1) {
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

          const tableName = df.path[0]
          const depends = [tableName]

          if (df.path[1] === 'schema') {
            // if (df.path.length === 3) - new field
            if (df.path.length === 3) {
              // new field - this should never happen
              // if (rhs && rhs.references) depends.push(rhs.references.model)

              actions.push({
                actionType: 'addColumn',
                tableName,
                attributeName: df.path[2],
                options: rhs,
                depends
              })
              break
            }

            // if (df.path.length > 3) - add new attribute to column (change col)
            if (df.path.length > 3)
              if (df.path[1] === 'schema') {
                // new field attributes
                const options = currentStateTables[tableName].schema[df.path[2]]

                if (options.references) depends.push(options.references.model)

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
          if (df.path[1] === 'indexes' && rhs) {
            const tableName = df.path[0]
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
          const tableName = df.path[0]

          if (df.path.length === 1) {
            // drop table
            const depends: string[] = []
            Object.values(df.lhs.schema).forEach((v: any) => {
              if (v.references) depends.push(v.references.model)
            })

            actions.push({
              actionType: 'dropTable',
              tableName,
              depends
            })
            break
          }

          if (df.path[1] === 'schema') {
            // if (df.path.length === 3) - drop field
            if (df.path.length === 3) {
              // drop column
              actions.push({
                actionType: 'removeColumn',
                tableName,
                columnName: df.path[2],
                depends: [tableName]
              })
              break
            }

            // if (df.path.length > 3) - drop attribute from column (change col)
            if (df.path.length > 3) {
              const depends = [tableName]
              // new field attributes
              const options = currentStateTables[tableName].schema[df.path[2]]
              if (options.references) depends.push(options.references.model)

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

          if (df.path[1] === 'indexes' && df.lhs) {
            actions.push({
              actionType: 'removeIndex',
              tableName,
              fields: df.lhs.fields,
              options: df.lhs.options,
              depends: [tableName]
            })
            break
          }
        }
        break

      // edit
      case 'E':
        {
          const tableName = df.path[0]
          const depends = [tableName]

          if (df.path[1] === 'schema') {
            // new field attributes
            const options = currentStateTables[tableName].schema[df.path[2]]
            if (options.references) depends.push(options.references.model)

            actions.push({
              actionType: 'changeColumn',
              tableName,
              attributeName: df.path[2],
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
