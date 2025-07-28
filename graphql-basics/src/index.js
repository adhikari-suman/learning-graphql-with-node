import { GraphQLServer } from "graphql-yoga";
import Query from "./resolvers/Query.js";
import Mutation from "./resolvers/Mutation.js";
import User from "./resolvers/User.js";
import Post from "./resolvers/Post.js";
import Comment from "./resolvers/Comment.js";
import db from "./db.js";

// Resolvers
const resolvers = {
  Query,
  Mutation,
  User,
  Post,
  Comment,
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    db,
  },
});

server.start(() => {
  console.log("The server is up!");
});
