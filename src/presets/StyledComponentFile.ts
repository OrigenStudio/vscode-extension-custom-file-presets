import { uniq } from 'lodash';

import { AppModel } from "../appModel";
import templateJS from '../helpers/templateJS';
import classNamesToClassKeyType from '../helpers/classNamesToClassKeyType';
import classNamesToClassStyles from '../helpers/classNamesToClassStyles';

AppModel.addPreset({
  name: "Styled Component File",
  key: "StyledComponentFile",
  description: "Have to make a better description",
  questions: [
    {
      key: "componentName",
      label: "Name of the component"
    },
    {
      key: "classNames",
      label: "Introduce the Class Names (separated with spaces)"
    }
  ],
  files: ({ componentName = 'StyledComponent', classNames }) => {
    const classesArray = ["root", ...(classNames ? classNames.split(" ") : [])];
    return {
      [`${componentName}.jsx`]: templateJS`
        // @flow
        import * as React from 'react';
        import withStyles, {
          type StyleRulesCallback,
          type WithStyles,
        } from '@material-ui/core/styles/withStyles';
        import type { Theme } from '@material-ui/core/styles/createMuiTheme';
        import classnames from 'classnames';
import classNamesToClassStyles from '../helpers/classNamesToClassStyles';

        export type ClassKey = ${classNamesToClassKeyType(uniq(classesArray))};

        export type Props = {
          ...$Exact<WithStyles<ClassKey>>,
          className?: string,
        };

        export type Styles = StyleRulesCallback<Theme, Props, ClassKey>;

        export const styles: Styles = unusedTheme => ({
        ${classNamesToClassStyles(uniq(classesArray))}
        });

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
      `
    };
  }
});
