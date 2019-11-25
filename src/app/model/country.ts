export class Country {
  id: number;
  name: string;
  phone_numbers: any[];
  key: any;
  constructor(id: number, name: string, phone_numbers: any[], key: any) {
    this.id = id;
    this.name = name;
    this.phone_numbers = phone_numbers;
    this.key = key
  }
}
