// Named export - has a name. Have as many as needed
const message = "Some message from myModule.js";
const name = "Ariel";

const location = "Fairfield, IA";

const getGreeting = (name) => {
  return `Welcome to the course ${name}`;
};

export { message, name, location as default, getGreeting };
