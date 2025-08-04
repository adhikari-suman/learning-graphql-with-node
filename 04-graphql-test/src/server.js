import { GraphQLServer, PubSub } from "graphql-yoga";

import { PrismaClient } from "@prisma/client";
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

export { server as default };
