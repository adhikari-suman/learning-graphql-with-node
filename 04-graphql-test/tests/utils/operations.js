import { gql } from "apollo-boost";

const createUser = gql`
  mutation ($data: CreateUserInput!) {
    createUser(data: $data) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const getUsers = gql`
  query {
    users {
      id
      name
      email
    }
  }
`;

const login = gql`
  mutation ($data: LoginUserInput!) {
    login(data: $data) {
      token
    }
  }
`;

const getProfile = gql`
  query {
    me {
      id
      name
      email
    }
  }
`;

const getPosts = gql`
  query {
    posts {
      id
      title
      body
      published
    }
  }
`;

const getUserPosts = gql`
  query {
    myPosts {
      id
      title
      body
      published
    }
  }
`;

const updatePost = gql`
  mutation ($postId: ID!) {
    updatePost(id: $postId, data: { published: false }) {
      id
      title
      body
      published
    }
  }
`;

const createPost = gql`
  mutation ($data: CreatePostInput) {
    createPost(data: $data) {
      id
      title
      body
      published
    }
  }
`;

const deletePost = gql`
  mutation ($postId: ID!) {
    deletePost(id: $postId) {
      id
      title
      body
      published
    }
  }
`;

export { createUser, getUsers, login, getProfile ,createPost,updatePost, deletePost, getUserPosts, getPosts};
