const Subscription = {
  comment: {
    subscribe(parent, args, { db, pubSub }, info) {
      const { postId } = args;

      const post = db.posts.find(
        (post) => post.id === postId && post.published
      );

      if (!post) {
        throw new Error("Post not found or published.");
      }

      return pubSub.asyncIterator(`comment ${postId}`);
    },
  },

  post: {
    subscribe(parent, args, { pubSub }, info) {
      return pubSub.asyncIterator("post");
    },
  },
};

export { Subscription as default };
