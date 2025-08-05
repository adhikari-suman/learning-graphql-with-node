import { deleteComment } from "./utils/operations";
import getClient from "./utils/getClient.js";
import seedDatabase, {
  userOne,
  userTwo,
  commentOne,
} from "./utils/seedDatabase.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeEach(seedDatabase);

test("should delete own comment", async () => {
  // arrange
  const client = getClient(userTwo.jwt);
  const variables = {
    id: commentOne.comment.id,
  };

  // act
  const { data } = await client.mutate({
    mutation: deleteComment,
    variables,
  });

  // assert
  expect(data.deleteComment.id).toBe(commentOne.comment.id);

  await expect(
    prisma.comment.findFirstOrThrow({ where: { id: data.deleteComment.id } })
  ).rejects.toThrow();

  const comment = await prisma.comment.findFirst({
    where: { id: data.deleteComment.id },
  });

  expect(comment).toBeNull();
});

test("should not delete other user's comment", async () => {
  // arrange
  const client = getClient(userOne.jwt);
  const variables = {
    id: commentOne.comment.id,
  };

  // actw

  // assert
  await expect(
    client.mutate({
      mutation: deleteComment,
      variables,
    })
  ).rejects.toThrow();
});
