const User = {
  async posts(parent, args, { prisma }, info) {
    console.log("Posts: ", parent);

    return prisma.post.findMany({ where: { authorId: parent.id } });
  },
  async comments(parent, args, { prisma }, info) {
    console.log("Comments: ", parent);
    return prisma.comment.findMany({ where: { authorId: parent.id } });
  },
};
