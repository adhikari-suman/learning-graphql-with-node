import uuid from "uuid";

const Mutation = {
  createUser(parent, args, { db }, info) {
    const emailTaken = db.users.some((user) => user.email === args.data.email);

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
};

export { Mutation as default };
