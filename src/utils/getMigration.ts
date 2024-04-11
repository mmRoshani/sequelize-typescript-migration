import { snakeCase } from "./snakeCase";

export default function getMigration(actions) {
  const commandsUp: string[] = [];
  const commandsDown: string[] = [];
  const consoleOut: string[] = [];

  for (const i in actions) {
    const action = actions[i];

    switch (action.actionType) {
      case "createTable":
        {
          const resUp = `
{ fn: "createTable", params: [
"${action.tableName}",
${getAttributes(action.attributes)},
${JSON.stringify(action.options)}
] }`;
          commandsUp.push(resUp);
          consoleOut.push(
            `createTable "${action.tableName}", deps: [${action.depends.join(
              ", "
            )}]`
          );
        }
        break;

      case "dropTable":
        {
          const res = `{ fn: "dropTable", params: ["${action.tableName}"] }`;

          commandsUp.push(res);
          consoleOut.push(`dropTable "${action.tableName}"`);
        }
        break;

      case "addColumn":
        {
          const resUp = `{ fn: "addColumn", params: [
    "${action.tableName}",
    "${action.attributeName}",
    ${propertyToStr(action.options)}
] }`;

          commandsUp.push(resUp);
          consoleOut.push(
            `addColumn "${action.attributeName}" to table "${action.tableName}"`
          );
        }
        break;

      case "removeColumn":
        {
          const res = `{ fn: "removeColumn", params: ["${action.tableName}", "${action.columnName}"] }`;

          commandsUp.push(res);
          consoleOut.push(
            `removeColumn "${action.columnName}" from table "${action.tableName}"`
          );
        }
        break;

      case "changeColumn":
        {
          const res = `{ fn: "changeColumn", params: [
    "${action.tableName}",
    "${action.attributeName}",
    ${propertyToStr(action.options)}
] }`;
          commandsUp.push(res);
          consoleOut.push(
            `changeColumn "${action.attributeName}" on table "${action.tableName}"`
          );
        }
        break;

      case "addIndex":
        {
          if (!action.options.name.startsWith(snakeCase(action.tableName))) {
            action.options.name = `${snakeCase(action.tableName)}_${action.options.name}`;
          }
          const res = `{ fn: "addIndex", params: [
    "${action.tableName}",
    ${JSON.stringify(action.fields)},
    ${JSON.stringify(action.options)}
] }`;
          commandsUp.push(res);

          const nameOrAttrs =
            action.options &&
            action.options.name &&
            action.options.name !== ""
              ? `"${action.options.name}"`
              : JSON.stringify(action.fields);

          consoleOut.push(
            `addIndex ${nameOrAttrs} to table "${action.tableName}"`
          );
        }
        break;

      case "removeIndex": {
        if (!action.options.name.startsWith(snakeCase(action.tableName))) {
          action.options.name = `${snakeCase(action.tableName)}_${action.options.name}`;
        }
        const nameOrAttrs =
          action.options &&
          action.options.name &&
          action.options.name !== ""
            ? `"${action.options.name}"`
            : JSON.stringify(action.fields);
        const res = `{ fn: "removeIndex", params: [
          "${action.tableName}",
          ${nameOrAttrs}
      ] }`;

        commandsUp.push(res);
        consoleOut.push(
          `removeIndex ${nameOrAttrs} from table "${action.tableName}"`
        );
        break;
      }

      default:
      // code
    }
  }

  return { commandsUp, commandsDown, consoleOut };
}

const propertyToStr = (obj) => {
  const values: string[] = [];

  for (const k in obj) {
    if (k === "seqType") {
      values.push(`"type": ${obj[k]}`);

      continue;
    }

    if (k === "defaultValue") {
      if (obj[k].internal) {
        values.push(`"defaultValue": ${obj[k].value}`);

        continue;
      }

      if (obj[k].notSupported) continue;

      const x = {};

      x[k] = obj[k].value;
      values.push(JSON.stringify(x).slice(1, -1));

      continue;
    }

    const x = {};

    x[k] = obj[k];
    values.push(JSON.stringify(x).slice(1, -1));
  }

  return `{ ${values
    .filter((v) => v !== "")
    .reverse()
    .join(", ")} }`;
};

const getAttributes = (attrs) => {
  const ret: string[] = [];

  for (const attrName in attrs)
    ret.push(`      "${attrName}": ${propertyToStr(attrs[attrName])}`);

  return ` { \n${ret.join(", \n")}\n     }`;
};
