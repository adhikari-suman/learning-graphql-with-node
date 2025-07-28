import { GraphQLServer } from "graphql-yoga";
import uuid from "uuid";

// Scalar Types (Single Value): String, Boolean, Int, Float, ID (unique identifiers)

// Demo user data
let users = [
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

let posts = [
  {
    id: "1",
    title: "GraphQL Basics",
    body: "Learning GraphQL is fun!",
    published: true,
    author: "1",
  },
  {
    id: "2",
    title: "Advanced GraphQL",
    body: "Exploring advanced topics in GraphQL.",
    published: false,
    author: "2",
  },
  {
    id: "3",
    title: "GraphQL vs REST",
    body: "Comparing GraphQL with REST APIs.",
    published: true,
    author: "3",
  },
  {
    id: "4",
    title: "GraphQL Subscriptions",
    body: "Understanding real-time data with GraphQL subscriptions.",
    published: true,
    author: "1",
  },
  {
    id: "5",
    title: "GraphQL and Apollo",
    body: "Using Apollo Client with GraphQL.",
    published: false,
    author: "3",
  },
];

let comments = [
  {
    id: "1",
    text: "Great post!",
    author: "1",
    post: "1",
  },
  {
    id: "2",
    text: "Very informative.",
    author: "2",
    post: "2",
  },
  {
    id: "3",
    text: "I learned a lot from this.",
    author: "3",
    post: "3",
  },
  {
    id: "4",
    text: "Can't wait to apply this knowledge!",
    author: "1",
    post: "4",
  },
  {
    id: "5",
    text: "Thanks for sharing!",
    author: "2",
    post: "5",
  },
];

// type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query:String): [Post!]!
        me: User!
        post: Post!      
        comments: [Comment!]!  
    }

    type Mutation {
      createUser(data: CreateUserInput): User!
      deleteUser(id: ID!): User!
      createPost(data: CreatePostInput): Post!
      createComment(data: CreateCommentInput): Comment!
    }

    input CreateUserInput {
      name: String!
      email: String!
      age: Int
    }

    input CreatePostInput {
      title: String!, 
      body: String!, 
      published: Boolean!, 
      author: ID!
    }

    input CreateCommentInput {
      text: String!, 
      author: ID!, 
      post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int  
        posts: [Post!]!    
        comments: [Comment!]!  
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
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
    comments() {
      return comments;
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.data.email);

      if (emailTaken) {
        throw new Error("Email taken.");
      }

      const user = {
        id: uuid.v4(),
        ...args.data,
      };

      users.push(user);

      return user;
    },
    deleteUser(parent, args, ctx, info) {
      const userIdx = users.findIndex((user) => user.id === args.id);

      if (userIdx === -1) {
        throw new Error("User not found.");
      }

      const deletedUsers = users.splice(userIdx, 1);

      posts = posts.filter((post) => post.author !== args.id);
      comments = comments.filter((comment) => comment.author !== args.id);

      return deletedUsers[0];
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author);

      if (!userExists) {
        throw new Error("User not found.");
      }

      const post = {
        id: uuid.v4(),
        ...args.data,
      };

      posts.push(post);

      return post;
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author);

      if (!userExists) {
        throw new Error("User not found.");
      }

      const postExists = posts.some(
        (post) => post.id === args.data.post && post.published
      );

      if (!postExists) {
        throw new Error("Post not found or not published.");
      }

      const comment = {
        id: uuid.v4(),
        ...args.data,
      };

      comments.push(comment);

      return comment;
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => user.id === parent.author);
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => comment.post === parent.id);
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => post.author === parent.id);
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => comment.author === parent.id);
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => user.id === parent.author);
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => post.id === parent.post);
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() => {
  console.log("The server is up!");
});
