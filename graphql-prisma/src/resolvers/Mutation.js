import uuid from "uuid";

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: args.data.email },
    });

    if (emailTaken) {
      throw new Error("Email taken.");
    }

    const userData = {
      ...args.data,
    };

    const user = await prisma.user.create({
      data: userData,
    });

    return user;
  },
  updateUser(parent, args, { db }, info) {
    const { id, data } = args;
    const user = db.users.find((user) => user.id === id);

    if (!user) {
      throw new Error("User not found.");
    }

    if (typeof data.email === "string") {
      const emailTaken = db.users.some(
        (user) => user.email === data.email && user.id !== id
      );

      if (emailTaken) {
        throw new Error("Email taken.");
      }

      user.email = data.email;
    }

    if (typeof data.name === "string") {
      user.name = data.name;
    }

    if (typeof data.age !== "undefined") {
      user.age = data.age;
    }

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
  createPost(parent, args, { db, pubSub }, info) {
    const userExists = db.users.some((user) => user.id === args.data.author);

    if (!userExists) {
      throw new Error("User not found.");
    }

    const post = {
      id: uuid.v4(),
      ...args.data,
    };

    db.posts.push(post);

    if (post.published) {
      pubSub.publish("post", {
        post: {
          mutation: "CREATED",
          data: post,
        },
      });
    }

    return post;
  },
  updatePost(parent, args, { db, pubSub }, info) {
    const { id, data } = args;
    const post = db.posts.find((post) => post.id === id);
    const originalPost = { ...post };

    if (!post) {
      throw new Error("Post not found.");
    }

    if (typeof data.title === "string") {
      post.title = data.title;
    }

    if (typeof data.body === "string") {
      post.body = data.body;
    }

    if (typeof data.published === "boolean") {
      post.published = data.published;

      if (originalPost.published && !post.published) {
        pubSub.publish("post", {
          post: {
            mutation: "DELETED",
            data: originalPost,
          },
        });
      } else if (!originalPost.published && post.published) {
        pubSub.publish("post", {
          post: {
            mutation: "CREATED",
            data: post,
          },
        });
      } else if (post.published) {
        pubSub.publish("post", {
          post: {
            mutation: "UPDATED",
            data: post,
          },
        });
      }
    }

    return post;
  },
  deletePost(parent, args, { db, pubSub }, info) {
    const postIdx = db.posts.findIndex((post) => post.id === args.id);

    if (postIdx === -1) {
      throw new Error("Post not found.");
    }

    const [deletedPost] = db.posts.splice(postIdx, 1);

    db.comments = db.comments.filter((comment) => comment.post !== args.id);

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
  createComment(parent, args, { db, pubSub }, info) {
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

    pubSub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: "CREATED",
        data: comment,
      },
    });

    return comment;
  },
  deleteComment(parent, args, { db, pubSub }, info) {
    const commentIdx = db.comments.findIndex(
      (comment) => comment.id === args.id
    );

    if (commentIdx === -1) {
      throw new Error("Comment not found.");
    }

    const [deletedComment] = db.comments.splice(commentIdx, 1);

    pubSub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: "DELETED",
        data: deletedComment,
      },
    });

    return deletedComment;
  },
  updateComment(parent, args, { db, pubSub }, info) {
    const { id, data } = args;
    const comment = db.comments.find((comment) => comment.id === id);

    if (!comment) {
      throw new Error("Comment not found.");
    }

    if (typeof data.text === "string") {
      comment.text = data.text;
    }

    pubSub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: "UPDATED",
        data: comment,
      },
    });

    return comment;
  },
};

export { Mutation as default };
