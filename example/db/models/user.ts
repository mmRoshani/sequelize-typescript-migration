import { Model, Column, Table, DataType } from 'sequelize-typescript'

@Table({
  paranoid: true,
  tableName: 'users'
})
class User extends Model {
  @Column({
    type: DataType.STRING
  })
  name!: string
}

export { User }
