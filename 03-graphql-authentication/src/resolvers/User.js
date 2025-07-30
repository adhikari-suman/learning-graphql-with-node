import getUserId from "../utils/getUserId.js";

const User = {
  async posts(parent, args, { prisma }, info) {
    return prisma.post.findMany({ where: { authorId: parent.id } });
  },
  async comments(parent, args, { prisma }, info) {
    return prisma.comment.findMany({ where: { authorId: parent.id } });
  },

  async email(parent, args, { prisma, request }, info) {
    const userId = getUserId(request, false);

    if (userId && userId == parent.id) {
      return parent.email;
    } else {
      return null;
    }
  },
};

export { User as default };
