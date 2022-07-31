import { Table, Model, Column, Default, DataType } from 'sequelize-typescript'

@Table({
  paranoid: true,
  tableName: 'car_brands'
})
export class CarBrand extends Model {
  @Column
  name!: string

  @Default(true)
  @Column(DataType.BOOLEAN)
  isCertified!: boolean

  @Column
  imgUrl!: string

  @Column
  carsCount!: number
}
