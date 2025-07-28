const Query = {
  posts(parent, args, { db }, info) {
    if (!args.query) {
      return db.posts;
    }

    return db.posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(args.query.toLowerCase()) ||
        post.body.toLowerCase().includes(args.query.toLowerCase())
      );
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
  comments() {
    return comments;
  },
};

export { Query as default };
