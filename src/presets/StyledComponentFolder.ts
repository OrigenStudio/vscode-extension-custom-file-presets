import { uniq } from 'lodash';
import * as yup from "yup";

import { AppModel } from "../appModel";
import templateJS from '../helpers/templateJS';
import classNamesToClassKeyType from '../helpers/classNamesToClassKeyType';
import classNamesToClassStyles from '../helpers/classNamesToClassStyles';

AppModel.addPreset({
  name: "Styled Component Folder",
  key: "StyledComponentFolder",
  description: "Have to make a better description",
  questions: [
    {
      key: "componentName",
      label: "Name of the component",
      validationSchema: yup.string().required()
    },
    {
      key: "classNames",
      label: "Introduce the Class Names (separated with spaces)"
    }
  ],
  files: ({ componentName = 'StyledComponent', classNames }) => {
    const classesArray = ["root", ...(classNames ? classNames.split(" ") : [])];
    return {
      [`${componentName}/${componentName}.jsx`]: templateJS`
        // @flow
        import * as React from 'react';
        import withStyles from '@material-ui/core/styles/withStyles';
        import classnames from 'classnames';

        import type { Props } from './types';
        import styles from './styles';

        const ${componentName} = ({
          className,
          classes,
          ...props
        }: Props): React.Node => {
          return <div className={classnames(classes.root, className)} {...props} />;
        };
          
        ${componentName}.defaultProps = {
          className: undefined,
        };
          
        export default withStyles<*, *, Props>(styles)(${componentName});
      `,
      [`${componentName}/styles.js`]: templateJS`
        // @flow
        import type { Styles } from './types';

        const styles: Styles = unusedTheme => ({
          ${classNamesToClassStyles(uniq(classesArray))}
        });

        export default styles;
      `,
      [`${componentName}/index.js`]: templateJS`
        // @flow
        export { default } from './${componentName}';
        export * from './types';
      `,
      [`${componentName}/types.js`]: templateJS`
        // @flow
        import * as React from 'react';
        import type {
          StyleRulesCallback,
          WithStyles,
        } from '@material-ui/core/styles/withStyles';
        import type { Theme } from '@material-ui/core/styles/createMuiTheme';
        
        export type ClassKey = ${classNamesToClassKeyType(uniq(classesArray))};
        
        export type Props = {
          ...$Exact<WithStyles<ClassKey>>,
          className?: string,
        };
        
        export type Styles = StyleRulesCallback<Theme, Props, ClassKey>;
      `
    };
  }
});
