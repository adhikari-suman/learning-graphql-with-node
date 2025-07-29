import getUserId from "../utils/getUserId.js";

const Query = {
  async myPosts(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    const opArgs = {
      where: {
        author: { id: userId },
      },
    };

    if (args.query) {
      opArgs.where.OR = [
        {
          title: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        {
          body: {
            contains: args.query,
            mode: "insensitive",
          },
        },
      ];
    }

    return prisma.post.findMany(opArgs);
  },
  async posts(parent, args, { prisma }, info) {
    const opArgs = {
      where: {
        published: true,
      },
    };

    if (args.query) {
      opArgs.where.OR = [
        {
          title: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        {
          body: {
            contains: args.query,
            mode: "insensitive",
          },
        },
      ];
    }

    return prisma.post.findMany(opArgs);
  },
  async users(parent, args, { prisma }, info) {
    if (!args.query) {
      return prisma.user.findMany();
    }

    return prisma.user.findMany({
      where: {
        OR: [
          {
            name: { contains: args.query, mode: "insensitive" },
          },
        ],
      },
    });
  },
  async me(parent, args, { request, prisma }, info) {
    const userId = getUserId(request);

    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        posts: true,
        comments: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
  async post(parent, args, { prisma, request }, info) {
    const userId = getUserId(request, false);

    const post = await prisma.post.findFirst({
      where: {
        id: args.id,
        OR: [
          {
            published: true,
          },
          {
            author: {
              id: userId,
            },
          },
        ],
      },
    });

    if (!post) {
      throw new Error("Post not found.");
    }

    return post;
  },
  async comments(parent, args, { prisma }, info) {
    return prisma.comment.findMany();
  },
};

export { Query as default };
