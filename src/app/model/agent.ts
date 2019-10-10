export class Agent {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;

  constructor(firstName, lastName, email, password, role) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
