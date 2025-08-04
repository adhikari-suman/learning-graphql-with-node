import { GraphQLServer, PubSub } from "graphql-yoga";

import { PrismaClient } from "./generated/prisma/client.js";
import { resolvers } from "./resolvers/index.js";
const pubSub = new PubSub();
const prisma = new PrismaClient();

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context(request) {
    return { pubSub, prisma, request };
  },
});

const PORT = process.env.PORT ?? 4000;
server.start(
  {
    port: PORT,
  },
  () => {
    console.log(`The server is up on port ${PORT}!`);
  }
);
