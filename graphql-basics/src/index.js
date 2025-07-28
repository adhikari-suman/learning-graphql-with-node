import { GraphQLServer } from "graphql-yoga";
import uuid from "uuid";

import db from "./db.js";

// Resolvers
const resolvers = {
  Query: {
    posts(parent, args, { db }, info) {
      if (!args.query) {
        return db.posts;
      }

      return db.posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(args.query.toLowerCase()) ||
          post.body.toLowerCase().includes(args.query.toLowerCase())
        );
      });
    },
    users(parent, args, { db }, info) {
      if (!args.query) {
        return db.users;
      }

      return db.users.filter((user) => {
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
    createUser(parent, args, { db }, info) {
      const emailTaken = db.users.some(
        (user) => user.email === args.data.email
      );

      if (emailTaken) {
        throw new Error("Email taken.");
      }

      const user = {
        id: uuid.v4(),
        ...args.data,
      };

      db.users.push(user);

      return user;
    },
    deleteUser(parent, args, { db }, info) {
      const userIdx = db.users.findIndex((user) => user.id === args.id);

      if (userIdx === -1) {
        throw new Error("User not found.");
      }

      const deletedUsers = db.users.splice(userIdx, 1);

      posts = db.posts.filter((post) => post.author !== args.id);
      comments = db.comments.filter((comment) => comment.author !== args.id);

      return deletedUsers[0];
    },
    createPost(parent, args, { db }, info) {
      const userExists = db.users.some((user) => user.id === args.data.author);

      if (!userExists) {
        throw new Error("User not found.");
      }

      const post = {
        id: uuid.v4(),
        ...args.data,
      };

      db.posts.push(post);

      return post;
    },
    deletePost(parent, args, { db }, info) {
      const postIdx = db.posts.findIndex((post) => post.id === args.id);

      if (postIdx === -1) {
        throw new Error("Post not found.");
      }

      const deletedPosts = db.posts.splice(postIdx, 1);

      comments = db.comments.filter((comment) => comment.post !== args.id);

      return deletedPosts[0];
    },
    createComment(parent, args, { db }, info) {
      const userExists = db.users.some((user) => user.id === args.data.author);

      if (!userExists) {
        throw new Error("User not found.");
      }

      const postExists = db.posts.some(
        (post) => post.id === args.data.post && post.published
      );

      if (!postExists) {
        throw new Error("Post not found or not published.");
      }

      const comment = {
        id: uuid.v4(),
        ...args.data,
      };

      db.comments.push(comment);

      return comment;
    },
    deleteComment(parent, args, { db }, info) {
      const commentIdx = db.comments.findIndex(
        (comment) => comment.id === args.id
      );

      if (commentIdx === -1) {
        throw new Error("Comment not found.");
      }

      const deletedComments = db.comments.splice(commentIdx, 1);

      return deletedComments[0];
    },
  },
  Post: {
    author(parent, args, { db }, info) {
      return db.users.find((user) => user.id === parent.author);
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter((comment) => comment.post === parent.id);
    },
  },
  User: {
    posts(parent, args, { db }, info) {
      return db.posts.filter((post) => post.author === parent.id);
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter((comment) => comment.author === parent.id);
    },
  },
  Comment: {
    author(parent, args, { db }, info) {
      return db.users.find((user) => user.id === parent.author);
    },
    post(parent, args, { db }, info) {
      return db.posts.find((post) => post.id === parent.post);
    },
  },
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
