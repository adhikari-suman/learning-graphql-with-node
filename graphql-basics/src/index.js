import { GraphQLServer } from "graphql-yoga";

// type definitions (schema)
const typeDefs = `
    type Query {
        hello: String!
        name: String!
        location: String!
        bio: String!
    }
`;

// Resolvers
const resolvers = {
  Query: {
    hello: () => "Hello world!",
    name: () => "Ariel",
    location: () => "Fairfield, IA",
    bio: () => "Ariel is a software developer in the US of A",
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() => {
  console.log("The server is up!");
});
