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

const userTwo = {
  input: {
    name: "Ariel",
    email: "ariel@example.com",
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

const postTwo = {
  input: {
    title: "My Draft post",
    body: "",
    published: false,
  },
  post: undefined,
};

const commentOne = {
  input: {
    text: "This is awesome",
  },
  comment: undefined,
};

const commentTwo = {
  input: {
    text: "You really think that?",
  },
  comment: undefined,
};

beforeAll(async () => {
  userOne.input.passwordHash = await hashPassword("Red098!@#$");
  userTwo.input.passwordHash = await hashPassword("Red098!@#$");
});

const prisma = new PrismaClient();

const seedDatabase = async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  userOne.user = await prisma.user.create({
    data: userOne.input,
  });
  userOne.jwt = generateToken(userOne.user.id);

  userTwo.user = await prisma.user.create({
    data: userTwo.input,
  });
  userTwo.jwt = generateToken(userTwo.user.id);

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
  postTwo.post = await prisma.post.create({
    data: {
      ...postTwo.input,
      author: {
        connect: { id: userOne.user.id },
      },
    },
  });

  // create comment one
  commentOne.comment = await prisma.comment.create({
    data: {
      ...commentOne.input,
      author: {
        connect: { id: userTwo.user.id },
      },
      post: {
        connect: { id: postOne.post.id },
      },
    },
  });

  // create comment two
  commentTwo.comment = await prisma.comment.create({
    data: {
      ...commentTwo.input,
      author: {
        connect: { id: userTwo.user.id },
      },
      post: {
        connect: { id: postOne.post.id },
      },
    },
  });
};

export {
  seedDatabase as default,
  userOne,
  postOne,
  postTwo,
  commentOne,
  commentTwo,
};
