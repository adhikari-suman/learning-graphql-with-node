import getUserId from "../utils/getUserId.js";

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

  myPost: {
    subscribe(parent, args, { pubSub, request }, info) {
      const userId = getUserId(request);

      return pubSub.asyncIterator(`myPost ${userId}`);
    },
  },
};

export { Subscription as default };
