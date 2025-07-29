import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const Mutation = {
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

    // TODO: fetch JWT_SECRET from .env
    const JWT_SECRET = "mysecret";

    const authPayload = {
      user: createdUser,
      token: jwt.sign({ userId: createdUser.id }, JWT_SECRET),
    };

    return authPayload;
  },
  async updateUser(parent, args, { prisma }, info) {
    const { id, data } = args;
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

      user.email = data.email;
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
  async deleteUser(parent, args, { prisma }, info) {
    const { id } = args;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error("User not found.");
    }

    // Delete related comments
    await prisma.comment.deleteMany({
      where: {
        authorId: id,
      },
    });

    // Delete related posts
    await prisma.post.deleteMany({
      where: {
        authorId: id,
      },
    });

    // Delete user
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return deletedUser;
  },
  async createPost(parent, args, { pubSub, prisma }, info) {
    const { title, body, published, author } = args.data;

    const userExists = await prisma.user.findFirst({
      where: { id: author },
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
          connect: { id: author },
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
  async updatePost(parent, args, { prisma, pubSub }, info) {
    const { id, data } = args;
    const post = await prisma.post.findUnique({ where: { id: id } });

    if (!post) {
      throw new Error("Post not found.");
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
      } else if (!originalPost.published && updatedPost.published) {
        pubSub.publish("post", {
          post: {
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
      }
    }

    return updatedPost;
  },
  async deletePost(parent, args, { prisma, pubSub }, info) {
    const post = await prisma.post.findUnique({ where: { id: args.id } });

    if (!post) {
      throw new Error("Post not found.");
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
  async createComment(parent, args, { prisma, pubSub }, info) {
    const { text, post, author } = args.data;
    const userExists = await prisma.user.findUnique({
      where: { id: author },
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
            id: author,
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
  async deleteComment(parent, args, { prisma, pubSub }, info) {
    const comment = await prisma.comment.findUnique({ where: { id: args.id } });

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
  async updateComment(parent, args, { prisma, pubSub }, info) {
    const { id, data } = args;
    const comment = await prisma.comment.findUnique({ where: { id: id } });

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
