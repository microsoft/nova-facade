import { graphql } from "relay-runtime";
import { useFragment } from "relay-hooks";
import * as React from "react";
import type { ServerWithExtension_dataFragment$key } from "./__generated__/ServerWithExtension_dataFragment.graphql";

export const ServerWithExtension_dataFragment = graphql`
  fragment ServerWithExtension_dataFragment on ServerObjectWithClientExtension {
    clientExtension
  }
`;

type Props = {
  data: ServerWithExtension_dataFragment$key;
};

export const ServerWithExtension = (props: Props) => {
  const data = useFragment(ServerWithExtension_dataFragment, props.data);

  return (
    <div>
      <p>{data.clientExtension}</p>
    </div>
  );
};
