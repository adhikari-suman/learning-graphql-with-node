import "cross-fetch/polyfill";
import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "@prisma/client";
import seedDatabase from "./utils/seedDatabase.js";

const client = new ApolloBoost({ uri: "http://localhost:4000" });
const prisma = new PrismaClient();

beforeEach(seedDatabase);

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
