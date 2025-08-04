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
