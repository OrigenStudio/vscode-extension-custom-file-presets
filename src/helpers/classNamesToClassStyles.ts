const classNamesToClassStyles = (classNames: Array<string>) =>
classNames.map(className => `${className}: {},`).join('\n')

export default classNamesToClassStyles;