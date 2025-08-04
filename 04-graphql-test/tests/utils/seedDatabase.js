import "cross-fetch/polyfill";
import { PrismaClient } from "@prisma/client";
import hashPassword from "../../src/utils/hashPassword.js";

const prisma = new PrismaClient();

const seedDatabase = async () => {
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
};

export { seedDatabase as default };
