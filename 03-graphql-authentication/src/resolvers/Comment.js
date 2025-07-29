const Comment = {
  async author(parent, args, { prisma }, info) {
    return prisma.user.findUnique({ where: { id: parent.authorId } });
  },
  async post(parent, args, { prisma }, info) {
    return prisma.post.findUnique({ where: { id: parent.postId } });
  },
};

export { Comment as default };
