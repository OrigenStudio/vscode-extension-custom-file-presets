const classNamesToClassKeyType = (classNames: Array<string>) =>
  classNames.map(className => `'${className}'`).join(" | ");

export default classNamesToClassKeyType;
