export class Passenger {
    firstName: string;
    lastName: string;
    age: number;
    adult: boolean;

    // function to get passenger details
    getPassengerDetails() {
        return `${this.firstName} ${this.lastName} - ${this.age} ${this.adult ? 'Adult' : 'child'}`;
    }
 }
