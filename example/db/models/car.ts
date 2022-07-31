import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  DataType
} from 'sequelize-typescript'

import { CarBrand } from './carBrand'

@Table({
  paranoid: true,
  tableName: 'cars'
})
export class Car extends Model {
  @Column
  name!: string

  @ForeignKey(() => CarBrand)
  @Column
  carBrandId!: number

  @BelongsTo(() => CarBrand)
  carBrand!: CarBrand

  @Column({
    type: DataType.INTEGER
  })
  year!: number
}
