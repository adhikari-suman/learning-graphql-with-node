import myCurrentLocation, { message, name, getGreeting } from "./myModule";
import addition, { subtract } from "./math";
console.log(message);
console.log(name);

console.log(myCurrentLocation);

console.log(getGreeting(name));

console.log(addition(5, 3));
console.log(subtract(10, 4));
