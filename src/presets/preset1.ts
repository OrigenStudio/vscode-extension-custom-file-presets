import { AppModel } from "../appModel";

AppModel.addPreset({
  name: "NamePreset1",
  key: "KeyPreset1",
  description: "descripció del primer preset",
  questions: [
      {
          key: 'componentName',
          label: 'Name of the component',
      },
      {
          key: 'hasStyles',
          label: 'Does the component has styles?',
      },
  ],
  files: ({ componentName, hasStyles }) => ({
    [`${componentName}/${componentName}.jsx`]: `
        // @flow
        // preset.js

        ${hasStyles ? `
            import withStyles from '@material-ui/core/withStyles';
        ` : ''}

        export type Props = {

        };

        const ${componentName} = (props: Props) => {
            return ();
        }
        export default ${componentName};
    `,
    [`${componentName}/index.js`]: `
        // @flow
        export { default } from './${componentName}';
    `
  })
});
