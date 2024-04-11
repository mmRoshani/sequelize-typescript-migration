# sequelize-typescript-migration-ht

#### Idea: founded the best changes at each 27th fork from the main repository and merge them together.

- Use it from [here](https://www.npmjs.com/package/sequelize-typescript-migration-ht) by the name of `sequelize-typescript-migration-ht`

- Here is the [Github discussion](https://github.com/mmRoshani/sequelize-typescript-migration/discussions), any ideas/improves are very welcome.

#### Tutorial

[youtube video](https://www.youtube.com/embed/bBv75hssPKk)

[![video](https://img.youtube.com/vi/bBv75hssPKk/0.jpg)](https://www.youtube.com/embed/bBv75hssPKk)


#### Installation

```js
npm i sequelize-typescript-migration-ht
// Or
yarn add sequelize-typescript-migration-ht
```

Thanks kimjbstar, mricharz, syon-development, viinzzz and lou2013 for the awesome lib.

## General info

It is based on [sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript), not supports "sequelize" based model codes.
and you need prior knowledge of migration of Sequelize.

[Sequelize Migration Manual](https://sequelize.org/master/manual/migrations.html)

This scans models and its decorators to find changes, and generates migration code with this changes so don't need to write up, down function manually. this is like "makemigration" in django framework.

After generate successfully, you can use "migrate" in [Sequelize](https://sequelize.org/)
[Sequelize Migration Manual](https://sequelize.org/master/manual/migrations.html)

**This refers to [GitHub - flexxnn/sequelize-auto-migrations: Migration generator && runner for sequelize](https://github.com/flexxnn/sequelize-auto-migrations) and its forks, and modified to typescript.**

Sometimes, undo(down) action may not work, then you should modify manually. Maybe it's because of ordering of relations of models.
That issue is currently in the works.

### Compatibility

- Use version `~2.0.0` for `sequelize@~6.0.0`
- Use version `~1.0.0` for `sequelize@~4.0.0`

## Usage Example

```typescript
import { join } from 'path'
import { Sequelize } from "sequelize-typescript";
import { SequelizeTypescriptMigration } from "sequelize-typescript-migration-ht";

const sequelize: Sequelize = new Sequelize({
  // .. options
});

await SequelizeTypescriptMigration.makeMigration(sequelize, {
  outDir: join(__dirname, './migrations'),
  migrationName: "add-awesome-field-in-my-table",
  preview: false,
});
```

let's see example, if you have this two models and run first makeMigration, it detects all table change from nothing.

```typescript
@Table
export class CarBrand extends Model<CarBrand> {
  @Column
  name: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isCertified: boolean;

  @Column
  imgUrl: string;

  @Column
  orderNo: number;

  @Column
  carsCount: number;
}
```

```typescript
@Table
export class Car extends Model<Car> {
  @Column
  name: string;

  @ForeignKey(() => CarBrand)
  @Column
  carBrandId: number;

  @BelongsTo(() => CarBrand)
  carBrand: CarBrand;
}
```

then this code written to 00000001-noname.js in migrations path.

```javascript
"use strict";

var Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable "CarBrands", deps: []
 * createTable "Cars", deps: [CarBrands]
 *
 **/

var info = {
  revision: 1,
  name: "noname",
  created: "2020-04-12T15:49:58.814Z",
  comment: "",
};

var migrationCommands = [
  {
    fn: "createTable",
    params: [
      "CarBrands",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
        },
        isCertified: {
          type: Sequelize.BOOLEAN,
        },
        imgUrl: {
          type: Sequelize.STRING,
        },
        orderNo: {
          type: Sequelize.INTEGER,
        },
        carsCount: {
          type: Sequelize.INTEGER,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {},
    ],
  },

  {
    fn: "createTable",
    params: [
      "Cars",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
        },
        carBrandId: {
          onDelete: "NO ACTION",
          onUpdate: "CASCADE",
          references: {
            model: "CarBrands",
            key: "id",
          },
          allowNull: true,
          type: Sequelize.INTEGER,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {},
    ],
  },
];

var rollbackCommands = [
  {
    fn: "dropTable",
    params: ["Cars"],
  },
  {
    fn: "dropTable",
    params: ["CarBrands"],
  },
];

module.exports = {
  pos: 0,
  up: function (queryInterface, Sequelize) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < migrationCommands.length) {
          let command = migrationCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  down: function (queryInterface, Sequelize) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < rollbackCommands.length) {
          let command = rollbackCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  info: info,
};
```

then you can apply this `npx sequelize db:migrate --to 00000001-noname.js`

## Possible Usage Scenario
Make sure to have writeMigration in your System under development and that sequelize is all set up

If you change a model and re-run the backend there should be a new file under `db/migrations`, but the database won't update automatically. There are easy but important steps:

1) Rename the file's name as well as the content (Info: name), so that everyone knows what this migration is about
2) Migrate your database `sequelize db:migrate`
3) Re-Serve the backend. You Should see 'No changes found'.
4) Test the automatically created file's down function `sequelize db:migrate:undo`
5) If there are any troubles, fix the auto-generated file (ordering!)
6) Run `sequelize db:migrate:undo` and continue your amazing work

## Documentation

Will be ready soon!

## Contributors

- [MohammadMojtaba Roshani](https://github.com/mmRoshani)
- [Anthony Luzquiños](https://github.com/anthonylzq)
- [Alexandr Cherednichenko](https://github.com/alexandr2110pro)
