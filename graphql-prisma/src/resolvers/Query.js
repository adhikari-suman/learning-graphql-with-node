const Query = {
  async posts(parent, args, { prisma }, info) {
    if (!args.query) {
      return prisma.post.findMany();
    }

    return prisma.post.findMany({
      where: {
        OR: [
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
        ],
      },
    });
  },
  users(parent, args, { db }, info) {
    if (!args.query) {
      return db.users;
    }

    return db.users.filter((user) => {
      return user.name.toLowerCase().includes(args.query.toLowerCase());
    });
  },
  me() {
    return {
      id: "12345",
      name: "Ariel",
      email: "ariel@gmail.com",
    };
  },
  post() {
    return {
      id: "54321",
      title: "GraphQL Basics",
      body: "Learning GraphQL is fun!",
      published: true,
    };
  },
  comments(parent, args, { db }, info) {
    return db.comments;
  },
};

export { Query as default };
