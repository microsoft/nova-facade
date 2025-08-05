import * as React from "react";
import { graphql, useFragment } from "react-relay";
import type { SuggestedFriends_suggestedFriendsFragment$key } from "./__generated__/SuggestedFriends_suggestedFriendsFragment.graphql";

type Props = {
  viewer: SuggestedFriends_suggestedFriendsFragment$key;
};

export const SuggestedFriends_suggestedFriendsFragment = graphql`
  fragment SuggestedFriends_suggestedFriendsFragment on Viewer {
    suggestedFriends {
      id
      name {
        firstName
        lastName
      }
    }
  }
`;

export const SuggestedFriendsComponent = (props: Props) => {
  const { suggestedFriends } = useFragment(
    SuggestedFriends_suggestedFriendsFragment,
    props.viewer,
  );

  if (!suggestedFriends || suggestedFriends.length === 0) {
    return <div>No suggested friends available.</div>;
  }
  return (
    <div style={{ padding: 16 }}>
      <h2>Suggested Friends</h2>
      {suggestedFriends.length === 0 ? (
        <p>No suggested friends at the moment.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {suggestedFriends.map((friend) => (
            <li
              key={friend.id}
              style={{
                padding: 8,
                margin: "8px 0",
                border: "1px solid #ddd",
                borderRadius: 4,
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>
                {friend.name?.firstName} {friend.name?.lastName}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
