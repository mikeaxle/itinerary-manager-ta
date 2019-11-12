export class Agent {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
