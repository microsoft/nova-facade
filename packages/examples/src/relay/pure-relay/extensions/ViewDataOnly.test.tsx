import { composeStories } from "@storybook/react";
import * as stories from "./ViewDataOnly.stories";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";

const { ViewDataOnlyStory, ViewDataOnlyWithServerFieldSelected } =
  composeStories(stories);

describe("ViewDataOnly", () => {
  it("renders ViewDataOnly component", () => {
    render(<ViewDataOnlyWithServerFieldSelected />);
    expect(screen.getByText(/This is a view data field/i)).toBeInTheDocument();
  });

  it("throws an exception when only client fields are selected in test query", () => {
    expect(() => {
      render(<ViewDataOnlyStory />);
    }).toThrowErrorMatchingInlineSnapshot(
      `"Client only queries are not supported in nova-react-test-utils, please add at least a single server field, otherwise mock resolvers won't be called. Addtionally if you want to test any queries with client extension, please use relay based payload generator over default one, as the default still doesn't support client extension. Check https://github.com/microsoft/nova-facade/tree/main/packages/nova-react-test-utils#pure-relay-or-nova-with-relay-how-can-i-make-sure-the-mock-data-is-generated-for-client-extensions"`,
    );
  });
});
