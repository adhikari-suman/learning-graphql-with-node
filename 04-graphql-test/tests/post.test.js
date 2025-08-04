import "cross-fetch/polyfill";
import { gql } from "apollo-boost";
import { PrismaClient } from "@prisma/client";
import seedDatabase, { userOne, postOne } from "./utils/seedDatabase.js";
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

test("should fetch user posts", async () => {
  // arrange
  const client = getClient(userOne.jwt);
  const getUserPosts = gql`
    query {
      myPosts {
        id
        title
        body
        published
      }
    }
  `;

  // act
  const { data } = await client.query({ query: getUserPosts });

  const publishedPosts = data.myPosts.filter((post) => post.published === true);
  const unpublishedPosts = data.myPosts.filter(
    (post) => post.published === false
  );

  // assert
  expect(data.myPosts.length).toBe(2);
  expect(publishedPosts.length).toBe(1);
  expect(unpublishedPosts.length).toBe(1);
});

test("Should be able to update own post", async () => {
  // arrange
  const client = getClient(userOne.jwt);
  const updatePost = gql`
    mutation {
      updatePost(id: "${postOne.post.id}"
      data: {
        published: false
      }){
        id
        title
        body
        published
      }
    }
  `;

  // act
  const { data } = await client.mutate({ mutation: updatePost });

  // assert
  expect(data.updatePost.id).toBe(postOne.post.id);
  expect(data.updatePost.published).toBe(false);

  const post = await prisma.post.findFirst({
    where: { id: postOne.post.id, published: false },
  });

  expect(post).not.toBe(null);
});

test("should create post for user successfully", async () => {
  // arrange
  const client = getClient(userOne.jwt);
  const createPost = gql`
    mutation {
      createPost(
        data: {
          title: "My own post"
          body: "It's a great post"
          published: true
        }
      ) {
        id
        title
        body
        published
      }
    }
  `;

  // act
  const { data } = await client.mutate({ mutation: createPost });

  // assert
  expect(data.createPost.title).toBe("My own post");
  expect(data.createPost.body).toBe("It's a great post");
  expect(data.createPost.published).toBe(true);
});
