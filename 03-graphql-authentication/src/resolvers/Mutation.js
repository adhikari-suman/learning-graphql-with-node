import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import getUserId from "../utils/getUserId.js";

// TODO: fetch JWT_SECRET from .env
const JWT_SECRET = "mysecret";

const Mutation = {
  async login(parent, args, { prisma }, info) {
    const { email, password } = args.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Invalid username or password.");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new Error("Invalid username or password.");
    }

    const authPayload = {
      user,
      token: jwt.sign({ userId: user.id }, JWT_SECRET),
    };

    return authPayload;
  },
  async createUser(parent, args, { prisma }, info) {
    const { name, email, age, password } = args.data;

    const emailTaken = await prisma.user.findUnique({
      where: { email: email },
    });

    if (emailTaken) {
      throw new Error("Email taken.");
    }

    if (password.length < 8) {
      throw new Error("Password must be 8 characters or longer.");
    }

    // TODO: salt rounds needs to be put in .env
    const SALT_ROUNDS = 12;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userData = { email, name, age, passwordHash: hashedPassword };

    const createdUser = await prisma.user.create({
      data: userData,
    });

    const authPayload = {
      user: createdUser,
      token: jwt.sign({ userId: createdUser.id }, JWT_SECRET),
    };

    return authPayload;
  },
  async updateUser(parent, args, { request, prisma }, info) {
    const id = getUserId(request);
    const { data } = args;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error("User not found.");
    }

    if (typeof data.email === "string") {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: {
            id: id, // exclude current user id
          },
        },
      });

      if (emailTaken) {
        throw new Error("Email taken.");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        // Only update fields that are provided in 'data'
        ...(typeof data.email === "string" && { email: data.email }),
        ...(typeof data.name === "string" && { name: data.name }),
        ...(typeof data.age !== "undefined" && { age: data.age }),
      },
    });

    return updatedUser;
  },
  async deleteUser(parent, args, { request, prisma }, info) {
    const userId = getUserId(request);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found.");
    }

    // Delete related comments
    await prisma.comment.deleteMany({
      where: {
        authorId: userId,
      },
    });

    // Delete related posts
    await prisma.post.deleteMany({
      where: {
        authorId: userId,
      },
    });

    // Delete user
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return deletedUser;
  },
  async createPost(parent, args, { pubSub, prisma, request }, info) {
    const userId = getUserId(request);

    const { title, body, published } = args.data;

    const userExists = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error("User not found.");
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        body,
        published,
        author: {
          connect: { id: userId },
        },
      },
    });

    if (newPost.published) {
      pubSub.publish("post", {
        post: {
          mutation: "CREATED",
          data: newPost,
        },
      });
    }

    return newPost;
  },
  async updatePost(parent, args, { prisma, pubSub, request }, info) {
    const userId = getUserId(request);

    const { id, data } = args;
    const post = await prisma.post.findFirst({
      where: { id: id, authorId: userId },
    });

    if (!post) {
      throw new Error("Unable to update post.");
    }

    const originalPost = { ...post };

    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: {
        title: typeof data.title === "string" ? data.title : undefined,
        body: typeof data.body === "string" ? data.body : undefined,
        published:
          typeof data.published === "boolean" ? data.published : undefined,
      },
    });

    if (typeof data.published === "boolean") {
      if (originalPost.published && !updatedPost.published) {
        pubSub.publish("post", {
          post: {
            mutation: "DELETED",
            data: originalPost,
          },
        });
        pubSub.publish(`myPost ${userId}`, {
          myPost: {
            mutation: "DELETED",
            data: originalPost,
          },
        });

        await prisma.comment.deleteMany({ where: { postId: id } });
      } else if (!originalPost.published && updatedPost.published) {
        pubSub.publish("post", {
          post: {
            mutation: "CREATED",
            data: updatedPost,
          },
        });
        pubSub.publish(`myPost ${userId}`, {
          myPost: {
            mutation: "CREATED",
            data: updatedPost,
          },
        });
      } else if (updatedPost.published) {
        pubSub.publish("post", {
          post: {
            mutation: "UPDATED",
            data: updatedPost,
          },
        });
        pubSub.publish(`myPost ${userId}`, {
          myPost: {
            mutation: "UPDATED",
            data: updatedPost,
          },
        });
      }
    }

    return updatedPost;
  },
  async deletePost(parent, args, { prisma, pubSub, request }, info) {
    const userId = getUserId(request);

    const post = await prisma.post.findFirst({
      where: { id: args.id, authorId: userId },
    });

    if (!post) {
      throw new Error("Unable to delete post.");
    }

    await prisma.comment.deleteMany({ where: { postId: args.id } });

    const deletedPost = await prisma.post.delete({ where: { id: args.id } });

    if (deletedPost.published) {
      pubSub.publish("post", {
        post: {
          mutation: "DELETED",
          data: deletedPost,
        },
      });
    }

    return deletedPost;
  },
  async createComment(parent, args, { prisma, pubSub, request }, info) {
    const userId = getUserId(request);

    const { text, post } = args.data;
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error("User not found.");
    }

    const postExists = await prisma.post.findUnique({
      where: {
        id: post,
        published: true,
      },
    });

    if (!postExists) {
      throw new Error("Post not found or not published.");
    }

    const savedComment = await prisma.comment.create({
      data: {
        text,
        author: {
          connect: {
            id: userId,
          },
        },
        post: {
          connect: {
            id: post,
          },
        },
      },
    });

    pubSub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: "CREATED",
        data: savedComment,
      },
    });

    return savedComment;
  },
  async deleteComment(parent, args, { prisma, pubSub, request }, info) {
    const userId = getUserId(request);
    const comment = await prisma.comment.findUnique({
      where: { id: args.id, authorId: userId },
    });

    if (!comment) {
      throw new Error("Comment not found.");
    }

    const deletedComment = await prisma.comment.delete({
      where: { id: args.id },
    });

    pubSub.publish(`comment ${deletedComment.postId}`, {
      comment: {
        mutation: "DELETED",
        data: deletedComment,
      },
    });

    return deletedComment;
  },
  async updateComment(parent, args, { prisma, pubSub, request }, info) {
    const userId = getUserId(request);
    const { id, data } = args;
    const comment = await prisma.comment.findUnique({
      where: { id: id, authorId: userId },
    });

    if (!comment) {
      throw new Error("Comment not found.");
    }

    const updatedComment = await prisma.comment.update({
      where: { id: id },
      data: {
        text: typeof data.text === "string" ? data.text : undefined,
      },
    });

    pubSub.publish(`comment ${updatedComment.postId}`, {
      comment: {
        mutation: "UPDATED",
        data: updatedComment,
      },
    });

    return updatedComment;
  },
};

export { Mutation as default };
