import "cross-fetch/polyfill";
import { gql } from "apollo-boost";
import { PrismaClient } from "@prisma/client";
import seedDatabase from "./utils/seedDatabase.js";
import getClient from "./utils/getClient.js";

const client = getClient();
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
