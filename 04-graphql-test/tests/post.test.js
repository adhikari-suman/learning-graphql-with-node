import "cross-fetch/polyfill";
import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "@prisma/client";
import seedDatabase from "./utils/seedDatabase.js";

const client = new ApolloBoost({ uri: "http://localhost:4000" });
const prisma = new PrismaClient();

beforeEach(seedDatabase);

test("should return only public posts", async () => {
  // arrange
  const getPosts = gql`
    query {
      posts {
        id
        title
        body
        published
      }
    }
  `;

  // act
  const response = await client.query({ query: getPosts });

  // assert
  expect(response.data.posts.length).toBe(1);
  expect(response.data.posts[0].published).toBe(true);
  expect(response.data.posts[0].title).toBe("GraphQL is fun");
  expect(response.data.posts[0].body).toBe(
    "Did you ever imagine it to be this fun!"
  );
});
