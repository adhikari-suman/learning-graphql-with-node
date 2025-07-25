import { GraphQLServer } from "graphql-yoga";

// Scalar Types (Single Value): String, Boolean, Int, Float, ID (unique identifiers)

// type definitions (schema)
const typeDefs = `
    type Query {
        add(numbers: [Float!]!): Float!
        greeting(name:String, position: String): String!
        me: User!
        post: Post!
        grades: [Int!]!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int        
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
    }
`;

// Resolvers
const resolvers = {
  Query: {
    grades() {
      return [99, 80, 93];
    },
    add(parent, args, ctx, info) {
      if (args.numbers.length === 0) {
        return 0;
      }

      return args.numbers.reduce((sum, current) => sum + current, 0);
    },
    greeting(parent, args, ctx, info) {
      if (args.name && args.position) {
        return `Hello ${args.name} You are my favorite ${args.position}`;
      }

      return "Hello";
    },
    me() {
      return {
        id: "12345",
        name: "Ariel",
        email: "ariel@gmail.com",
      };
    },
    post() {
      return {
        id: "54321",
        title: "GraphQL Basics",
        body: "Learning GraphQL is fun!",
        published: true,
      };
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() => {
  console.log("The server is up!");
});
