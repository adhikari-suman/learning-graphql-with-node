import { GraphQLServer } from "graphql-yoga";

// Scalar Types (Single Value): String, Boolean, Int, Float, ID (unique identifiers)

// Demo user data
const users = [
  {
    id: "1",
    name: "Ariel",
    email: "ariel@gmail.com",
    age: 18,
  },
  {
    id: "2",
    name: "John",
    email: "john@gmail.com",
    age: 25,
  },
  {
    id: "3",
    name: "Jane",
    email: "jane@gmail.com",
  },
];

const posts = [
  {
    id: "1",
    title: "GraphQL Basics",
    body: "Learning GraphQL is fun!",
    published: true,
  },
  {
    id: "2",
    title: "Advanced GraphQL",
    body: "Exploring advanced topics in GraphQL.",
    published: false,
  },
  {
    id: "3",
    title: "GraphQL vs REST",
    body: "Comparing GraphQL with REST APIs.",
    published: true,
  },
  {
    id: "4",
    title: "GraphQL Subscriptions",
    body: "Understanding real-time data with GraphQL subscriptions.",
    published: true,
  },
  {
    id: "5",
    title: "GraphQL and Apollo",
    body: "Using Apollo Client with GraphQL.",
    published: false,
  },
];

// type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query:String): [Post!]!
        me: User!
        post: Post!        
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
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts;
      }

      return posts.filter((posts) => {
        return (
          posts.title.toLowerCase().includes(args.query.toLowerCase()) ||
          posts.body.toLowerCase().includes(args.query.toLowerCase())
        );
      });
    },
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }

      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
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
