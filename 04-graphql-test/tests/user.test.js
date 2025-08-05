import "cross-fetch/polyfill";
import { gql } from "apollo-boost";
import { PrismaClient } from "@prisma/client";
import seedDatabase, { userOne } from "./utils/seedDatabase.js";
import getClient from "./utils/getClient.js";
import { createUser, getUsers, login, getProfile } from "./utils/operations.js";
const client = getClient();
const prisma = new PrismaClient();

beforeEach(seedDatabase);

test("should create a new user", async () => {
  // arrange
  const variables = {
    data: { name: "Ariel", email: "ariel@gmail.com", password: "MyPass$123" },
  };

  // act
  const response = await client.mutate({
    mutation: createUser,
    variables,
  });

  // assert
  const user = await prisma.user.findUnique({
    where: { id: response.data.createUser.user.id },
  });

  expect(user).not.toBeNull();
});

test("should expose public author profiles", async () => {
  // arrange

  // act
  const response = await client.query({ query: getUsers });

  // assert
  expect(response.data.users.length).toBe(1);
  expect(response.data.users[0].email).toBe(null);
  expect(response.data.users[0].name).toBe("Jen");
});

test("should not login with bad credentials", async () => {
  // arrange
  const variables = {
    data: { email: "john@gxample.com", password: "asdadkjsadlskdj" },
  };

  // act
  // assert
  await expect(client.mutate({ mutation: login, variables })).rejects.toThrow();
});

test("should fail signup with short password", async () => {
  // arrange
  const variables = {
    data: { name: "John", email: "john@gmail.com", password: "MyPass" },
  };

  // act
  // assert
  await expect(
    client.mutate({ mutation: createUser, variables })
  ).rejects.toThrow();
});

test("should fetch user profile", async () => {
  // arrange
  const client = getClient(userOne.jwt);

  // act
  const { data } = await client.query({ query: getProfile });

  // assert
  expect(data.me.id).toBe(userOne.user.id);
  expect(data.me.name).toBe(userOne.user.name);
  expect(data.me.email).toBe(userOne.user.email);
});
