import "cross-fetch/polyfill";
import { PrismaClient } from "@prisma/client";
import hashPassword from "../../src/utils/hashPassword.js";
import jwt from "jsonwebtoken";
import generateToken from "../../src/utils/generateToken.js";

const userOne = {
  input: {
    name: "Jen",
    email: "jen@example.com",
    passwordHash: undefined, // password set on beforeAll() below
  },
  user: undefined,
  jwt: undefined,
};

const postOne = {
  input: {
    title: "GraphQL is fun",
    body: "Did you ever imagine it to be this fun!",
    published: true,
  },
  post: undefined,
};

beforeAll(async () => {
  userOne.input.passwordHash = await hashPassword("Red098!@#$");
});

const prisma = new PrismaClient();

const seedDatabase = async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  userOne.user = await prisma.user.create({
    data: userOne.input,
  });
  userOne.jwt = generateToken(userOne.user.id);

  // create post one
  postOne.post = await prisma.post.create({
    data: {
      ...postOne.input,
      author: {
        connect: { id: userOne.user.id },
      },
    },
  });

  // create post two
  await prisma.post.create({
    data: {
      title: "My Draft post",
      body: "",
      author: {
        connect: { id: userOne.user.id },
      },
      published: false,
    },
  });
};

export { seedDatabase as default, userOne, postOne };
