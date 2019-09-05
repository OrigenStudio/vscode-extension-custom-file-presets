import { upperFirst, camelCase } from "lodash";
import * as yup from "yup";

import { AppModel } from "../appModel";
import templateJS from "../helpers/templateJS";

AppModel.addPreset({
  name: "Translated Prismic Single Node",
  key: "TranslatedPrismicSingleNode",
  description: "Have to make a better description",
  questions: [
    {
      key: "prismicType",
      label: "Prismic type (ex: 'home_page')",
      validationSchema: yup.string().required()
    }
  ],
  files: ({ prismicType: rawPrismicType = "PrismicComponent" }) => {
    const prismicType = upperFirst(camelCase(rawPrismicType));
    return {
    [`usePrismic${prismicType}.js`]: templateJS`
      // @flow
      import { graphql, useStaticQuery } from 'gatsby';
      
      import useFindCurrentLocaleNode from '~plugins/prismic/hooks/useFindCurrentLocaleNode';
      import type { Query, Prismic${prismicType} } from '~schema';
      
      const query = graphql\`
        query UseTranslatedPrismic${prismicType}DefaultQuery {
          allPrismic${prismicType} {
            nodes {
              id
              lang
            }
          }
        }
      \`;
      
      export default function usePrismic${prismicType}(): ?Prismic${prismicType} {
        return useFindCurrentLocaleNode<Prismic${prismicType}>({
          nodes: useStaticQuery<Query>(query).allPrismic${prismicType}?.nodes,
          toQuery: prismic${prismicType} => ({ prismic${prismicType} }),
          fromQuery: data => data?.prismic${prismicType},
        });
      }
      `
    };
  }
});
