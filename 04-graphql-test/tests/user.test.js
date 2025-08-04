import { getFirstName, isValidPassword } from "../src/utils/user.js";

test("should return first name when given full name", () => {
  // arrange
  const fullName = "Suman Adhikari";

  // act
  const firstName = getFirstName(fullName);

  // assert
  expect(firstName).toBe("Suman");
});

test("should return first name when given first name", () => {
  // arrange
  const fullName = "Suman";

  // act
  const firstName = getFirstName(fullName);

  // assert
  expect(firstName).toBe("Suman");
});

test("should reject password shorter than 8 characters", () => {
  // arrange
  const password = "Suman";

  // act
  const isValid = isValidPassword(password);

  // assert
  expect(isValid).toBe(false);
});

test("should reject password that contains the word password", () => {
  // arrange
  const password = "password1234";

  // act
  const isValid = isValidPassword(password);

  // assert
  expect(isValid).toBe(false);
});

test("should correctly validate a password", () => {
  // arrange
  const password = "Testing@123";

  // act
  const isValid = isValidPassword(password);

  // assert
  expect(isValid).toBe(true);
});
