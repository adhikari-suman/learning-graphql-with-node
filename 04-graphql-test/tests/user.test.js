import "cross-fetch/polyfill";
import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "@prisma/client";
import { existedOperationTypeMessage } from "graphql/validation/rules/UniqueOperationTypes";

const client = new ApolloBoost({ uri: "http://localhost:4000" });
const prisma = new PrismaClient();

test("should create a new user", async () => {
  // arrange
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "Ariel"
          email: "ariel@gmail.com"
          password: "MyPass$123"
        }
      ) {
        token
        user {
          id
        }
      }
    }
  `;

  // act
  const response = await client.mutate({
    mutation: createUser,
  });

  // assert
  const user = await prisma.user.findUnique({
    where: { id: response.data.createUser.user.id },
  });

  expect(user).not.toBeNull();
});
