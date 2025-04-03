import { graphql } from "relay-runtime";
import { useFragment } from "relay-hooks";
import * as React from "react";
import type { ViewDataOnly_viewDataFragment$key } from "./__generated__/ViewDataOnly_viewDataFragment.graphql";

export const ViewDataOnly_viewDataFragment = graphql`
  fragment ViewDataOnly_viewDataFragment on ViewData {
    viewDataField
  }
`;

type Props = {
  viewData: ViewDataOnly_viewDataFragment$key;
};

export const ViewDataOnly = (props: Props) => {
  const viewData = useFragment(ViewDataOnly_viewDataFragment, props.viewData);

  return (
    <div>
      <p>{viewData.viewDataField}</p>
    </div>
  );
};
