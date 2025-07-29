const Subscription = {
  comment: {
    async subscribe(parent, args, { prisma, pubSub }, info) {
      const { postId } = args;

      const post = await prisma.post.findUnique({
        where: { id: postId, published: true },
      });

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
