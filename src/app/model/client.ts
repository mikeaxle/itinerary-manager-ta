export class Client {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;

  constructor(firstName: string, lastName: string, email: string, phone: string, nationality: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.nationality = nationality;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
