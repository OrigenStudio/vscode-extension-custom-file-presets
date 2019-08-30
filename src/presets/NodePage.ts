import { uniq, upperFirst, camelCase } from 'lodash';

import { AppModel } from "../appModel";
import templateJS from '../helpers/templateJS';
import classNamesToClassKeyType from '../helpers/classNamesToClassKeyType';
import classNamesToClassStyles from '../helpers/classNamesToClassStyles';

AppModel.addPreset({
  name: "Node Page",
  key: "NodePage",
  description: "Have to make a better description",
  questions: [
    {
      key: "prismicType",
      label: "Prismic type (ex: 'node_page')"
    },
    {
      key: "componentName",
      label: "Name of the component"
    },
    {
      key: "classNames",
      label: "Introduce the Class Names (separated with spaces)"
    }
  ],
  files: ({ prismicType: rawPrismicType, componentName, classNames }) => {
    const prismicType = upperFirst(camelCase(rawPrismicType));
    const classesArray = ["root", ...(classNames ? classNames.split(" ") : [])];
    componentName = componentName || prismicType;
    return {
      [`${componentName}.jsx`]: templateJS`
      // @flow
      import * as React from 'react';
      import { graphql } from 'gatsby';
      import compose from 'recompose/compose';
      import withStyles, {
        type WithStyles,
      } from '@material-ui/core/styles/withStyles';
      import type { Theme } from '@material-ui/core/styles';
      import Container from '@material-ui/core/Container';
      import Typography from '@material-ui/core/Typography';
      
      import ResPadding from '~plugins/material-ui/components/ResPadding';
      import RichTextTypography from '~plugins/prismic/components/RichTextTypography';
      import withNodePage, {
        type WithNodePageProps,
      } from '~plugins/prismic/hocs/withNodePage';
      import type { Prismic${prismicType} } from '~schema';
      
      export type ClassKey = ${classNamesToClassKeyType(uniq(classesArray))};
      
      export type Props = {
        ...$Exact<WithStyles<ClassKey>>,
        ...$Exact<WithNodePageProps<Prismic${prismicType}>>,
      };
      
      const styles = (unusedTheme: Theme) => ({
        ${classNamesToClassStyles(uniq(classesArray))}
      });
      
      const ${componentName} = ({ classes, node }: Props) => {
        return (
          <Container
            component={ResPadding}
            vertical
            className={classes.root}
          >
            {node?.data?.title?.text ? (
              <Typography variant="h4" gutterBottom>
                {node?.data?.title?.text}
              </Typography>
            ) : null}
            <RichTextTypography {...node?.data?.description} />
          </Container>
        );
      };
      
      export default compose(
        withNodePage<Prismic${prismicType}, *>({
          getNode: data => data?.prismic${prismicType},
        }),
        withStyles<ClassKey, *, Props>(styles),
      )(${componentName});
      
      export const query = graphql\`
        query ${componentName}Query($prismicId: ID) {
          prismic${prismicType}(prismicId: { eq: $prismicId }) {
            id
            lang
            data {
              meta_title {
                text
              }
              meta_description {
                text
              }
              meta_keywords {
                meta_keyword {
                  text
                }
              }
              title {
                text
              }
              description {
                text
                html
              }
            }
          }
        }
      \`;
      `
    };
  }
});
