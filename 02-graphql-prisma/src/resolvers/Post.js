const Post = {
  async author(parent, args, { prisma }, info) {
    return prisma.user.findUnique({
      where: { id: parent.authorId },
    });
  },

  async comments(parent, args, { prisma }, info) {
    return prisma.comment.findMany({
      where: { postId: parent.id },
    });
  },
};

export default Post;
