import server from "./server.js";

const PORT = process.env.PORT ?? 4000;
server.start(
  {
    port: PORT,
  },
  () => {
    console.log(`The server is up on port ${PORT}!`);
  }
);
