import ApolloBoost, { gql } from "apollo-boost";

const client = new ApolloBoost({
  uri: "http://localhost:4000",
});

const getUsers = gql`
  query {
    users {
      id
      name
    }
  }
`;

client
  .query({
    query: getUsers,
  })
  .then((response) => {
    let html = "";

    for (let user of response.data.users) {
      html += `
        <div>
            <h3>${user.name}</h3>
        </div>
        `;
    }

    document.getElementById("users").innerHTML = html;
  });

const getPosts = gql`
  query {
    posts {
      id
      title
      body
      author {
        name
      }
    }
  }
`;

client
  .query({
    query: getPosts,
  })
  .then((response) => {
    let html = ``;

    for (let post of response.data.posts) {
      html += `
      <div>
        <h3>${post.title}</h3>
        <h4>Written by: ${post.author.name}</h4>
        <p>${post.body}</p>
      </div>`;
    }

    document.getElementById("posts").innerHTML = html;
  });
