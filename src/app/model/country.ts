export class Country {
  id: number;
  name: string;
  phone_numbers: any[];

  constructor(id: number, name: string, phone_numbers?: any[]) {
    this.id = id;
    this.name = name;
    this.phone_numbers = phone_numbers;
  }
}
