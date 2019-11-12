export class Passenger {
  firstName: string;
  lastName: string;
  age: number;
  adult: boolean;

  constructor(firstName, lastName, age, adult) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.adult = adult
  }

  Passenger() {
    this.firstName = 'John';
    this.lastName = 'Doe';
    this.age = 30;
    this.adult = false;
  }
}
