import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'

import { CarBrand } from './carBrand'

@Table
export class Car extends Model {
  @Column
  name!: string

  @ForeignKey(() => CarBrand)
  @Column
  carBrandId!: number

  @BelongsTo(() => CarBrand)
  carBrand!: CarBrand
}
