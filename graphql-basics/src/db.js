const users = [
  {
    id: "1",
    name: "Ariel",
    email: "ariel@gmail.com",
    age: 18,
  },
  {
    id: "2",
    name: "John",
    email: "john@gmail.com",
    age: 25,
  },
  {
    id: "3",
    name: "Jane",
    email: "jane@gmail.com",
  },
];

const posts = [
  {
    id: "1",
    title: "GraphQL Basics",
    body: "Learning GraphQL is fun!",
    published: true,
    author: "1",
  },
  {
    id: "2",
    title: "Advanced GraphQL",
    body: "Exploring advanced topics in GraphQL.",
    published: false,
    author: "2",
  },
  {
    id: "3",
    title: "GraphQL vs REST",
    body: "Comparing GraphQL with REST APIs.",
    published: true,
    author: "3",
  },
  {
    id: "4",
    title: "GraphQL Subscriptions",
    body: "Understanding real-time data with GraphQL subscriptions.",
    published: true,
    author: "1",
  },
  {
    id: "5",
    title: "GraphQL and Apollo",
    body: "Using Apollo Client with GraphQL.",
    published: false,
    author: "3",
  },
];

const comments = [
  {
    id: "1",
    text: "Great post!",
    author: "1",
    post: "1",
  },
  {
    id: "2",
    text: "Very informative.",
    author: "2",
    post: "2",
  },
  {
    id: "3",
    text: "I learned a lot from this.",
    author: "3",
    post: "3",
  },
  {
    id: "4",
    text: "Can't wait to apply this knowledge!",
    author: "1",
    post: "4",
  },
  {
    id: "5",
    text: "Thanks for sharing!",
    author: "2",
    post: "5",
  },
];

const db = {
  users,
  posts,
  comments,
};

export { db as default };
