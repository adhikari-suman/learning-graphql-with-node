const User = {
  async posts(parent, args, { prisma }, info) {
    return prisma.post.findMany({ where: { authorId: parent.id } });
  },
  async comments(parent, args, { prisma }, info) {
    return prisma.comment.findMany({ where: { authorId: parent.id } });
  },
};
