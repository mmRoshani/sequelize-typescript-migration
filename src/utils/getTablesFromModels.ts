import { Sequelize } from 'sequelize-typescript'
import { ModelCtor, Model, ModelAttributeColumnOptions } from 'sequelize'

import reverseSequelizeColType from './reverseSequelizeColType'
import { reverseSequelizeDefValueType } from './reverseSequelizeDefValueType'
import parseIndex from './parseIndex'
import {
  Json,
  CONSTRAINTS,
  Tables,
  TableSchema,
  ColumnSchema
} from './constants'

export default function reverseModels(
  sequelize: Sequelize,
  models: {
    [modelName: string]: ModelCtor<Model>
  }
): Tables {
  const tables: Tables = {}

  for (const [, model] of Object.entries(models)) {
    const attributes: {
      [key: string]: ModelAttributeColumnOptions
    } = model.rawAttributes
    const tableSchema: TableSchema = {}

    for (const [column, attribute] of Object.entries(attributes)) {
      let columnSchema: ColumnSchema = {}

      if (attribute.defaultValue) {
        const valueType = reverseSequelizeDefValueType(attribute.defaultValue)

        if (valueType.notSupported) {
          console.log(
            `[Not supported] Skip defaultValue column of attribute ${model}: ${column}`
          )

          continue
        }

        columnSchema.defaultValue = valueType
      }

      if (attribute.type === undefined) {
        console.log(
          `[Not supported] Skip column with undefined type ${model}: ${column}`
        )

        continue
      }

      const seqType: string = reverseSequelizeColType(sequelize, attribute.type)

      if (seqType === 'Sequelize.VIRTUAL') {
        console.log(
          `[SKIP] Skip Sequelize.VIRTUAL column "${column}"", defined in model "${model}"`
        )

        continue
      }

      columnSchema = {
        // ...columnSchema,
        seqType
      }
      CONSTRAINTS.forEach(key => {
        // @ts-expect-error I do not know why this shows an error
        if (attribute[key] !== undefined) columnSchema[key] = attribute[key]
      })
      tableSchema[column] = columnSchema
    } // attributes in model

    const indexOut: Json = {}

    if (
      model.options &&
      model.options.indexes &&
      model.options.indexes.length > 0
    )
      for (const i in model.options.indexes) {
        const index = parseIndex(model.options.indexes[i])

        indexOut[`${index.hash}`] = index
        delete index.hash
      }

    tables[model.tableName] = {
      tableName: model.tableName,
      schema: tableSchema,
      indexes: indexOut
    }
  } // model in models

  return tables
}
