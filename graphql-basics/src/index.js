import { GraphQLServer, PubSub } from "graphql-yoga";
import Query from "./resolvers/Query.js";
import Mutation from "./resolvers/Mutation.js";
import User from "./resolvers/User.js";
import Post from "./resolvers/Post.js";
import Comment from "./resolvers/Comment.js";
import Subscription from "./resolvers/Subscription.js";
import db from "./db.js";

// Resolvers
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Post,
  Comment,
};
const pubSub = new PubSub();

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    db,
    pubSub,
  },
});

server.start(() => {
  console.log("The server is up!");
});
