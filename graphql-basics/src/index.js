import { GraphQLServer } from "graphql-yoga";

// Scalar Types (Single Value): String, Boolean, Int, Float, ID (unique identifiers)

// type definitions (schema)
const typeDefs = `
    type Query {
        id: ID!
        name: String!
        age: Int!
        employed: Boolean!
        gpa: Float    
        title: String!
        price: Float!    
        releaseYear: Int
        rating: Float
        inStock: Boolean!
    }
`;

// Resolvers
const resolvers = {
  Query: {
    id() {
      return "abc123";
    },
    name() {
      return "Ariel";
    },
    age() {
      return 18;
    },
    employed() {
      return true;
    },
    gpa() {
      return 3.01;
    },
    title() {
      return "Apple iPhone 14 Pro Max";
    },
    price() {
      return 1099.99;
    },
    releaseYear() {
      return null;
    },
    rating() {
      return null;
    },
    inStock() {
      return true;
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() => {
  console.log("The server is up!");
});
