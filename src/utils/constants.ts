import { ModelAttributeColumnOptions } from 'sequelize'

export interface Json {
  [key: string]: any
}

export const CONSTRAINTS = [
  'allowNull',
  'unique',
  'primaryKey',
  'autoIncrement',
  'autoIncrementIdentity',
  'comment',
  'references',
  'onUpdate',
  'onDelete'
] as const

export interface ValueType {
  internal?: boolean
  value: string
  notSupported?: boolean
}

export type ColumnSchema = Partial<
  ModelAttributeColumnOptions & {
    seqType: string
  }
>

export type TableSchema = {
  [column: string]: ColumnSchema
}

export type Table = {
  tableName: string
  schema: TableSchema
  indexes?: Json
}

export type Tables = {
  [tableName: string]: Table
}

export interface MigrationState {
  revision?: number
  version?: number
  tables: Tables
}

export interface SequelizeMigrations {
  name: string
  date: Date
}

export interface SequelizeMigrationsMeta {
  revision: number
  name: string
  state: MigrationState
  date: Date
}
