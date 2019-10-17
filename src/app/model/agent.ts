export class Agent {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;

  getFullName() {
    return `${this.firstname} ${this.lastname}`;
  }
}
