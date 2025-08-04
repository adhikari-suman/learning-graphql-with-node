import "cross-fetch/polyfill";
import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "@prisma/client";
import hashPassword from "../src/utils/hashPassword.js";

const client = new ApolloBoost({ uri: "http://localhost:4000" });
const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const userJen = await prisma.user.create({
    data: {
      name: "Jen",
      email: "jen@example.com",
      passwordHash: await hashPassword("Red098!@#$"),
    },
  });

  await prisma.post.create({
    data: {
      title: "GraphQL is fun",
      body: "Did you ever imagine it to be this fun!",
      author: {
        connect: { id: userJen.id },
      },
      published: true,
    },
  });

  await prisma.post.create({
    data: {
      title: "My Draft post",
      body: "",
      author: {
        connect: { id: userJen.id },
      },
      published: false,
    },
  });
});

test("should create a new user", async () => {
  // arrange
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "Ariel"
          email: "ariel@gmail.com"
          password: "MyPass$123"
        }
      ) {
        token
        user {
          id
        }
      }
    }
  `;

  // act
  const response = await client.mutate({
    mutation: createUser,
  });

  // assert
  const user = await prisma.user.findUnique({
    where: { id: response.data.createUser.user.id },
  });

  expect(user).not.toBeNull();
});

test("should expose public author profiles", async () => {
  // arrange
  const getUsers = gql`
    query {
      users {
        id
        name
        email
      }
    }
  `;
  // act
  const response = await client.query({ query: getUsers });

  // assert
  expect(response.data.users.length).toBe(1);
  expect(response.data.users[0].email).toBe(null);
  expect(response.data.users[0].name).toBe("Jen");
});

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

test("should not login with bad credentials", async () => {
  // arrange
  const login = gql`
    mutation {
      login(data: { email: "john@gxample.com", password: "asdadkjsadlskdj" }) {
        token
      }
    }
  `;

  // act
  // assert
  await expect(client.mutate({ mutation: login })).rejects.toThrow();
});

test("should fail signup with short password", async () => {
  // arrange
  const createUser = gql`
    mutation {
      createUser(
        data: { name: "John", email: "john@gmail.com", password: "MyPass" }
      ) {
        token
        user {
          id
        }
      }
    }
  `;

  // act
  // assert
  await expect(client.mutate({ mutation: createUser })).rejects.toThrow();
});
