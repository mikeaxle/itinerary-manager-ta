import { Injectable } from '@angular/core';
import {Country} from './model/country';
import {Region} from './model/region';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  // function to generate countries array
  getCountries() {
    return [
      new Country(1, 'Tanzania', [{time: 'Office Hours', number: '+255 784 999 736'}, {time: 'After Hours', number: '+255 784 666 510'}, {time: 'Alternate After Hours', number: '+27 72 710 4045'} ]),
      new Country(2, 'Rwanda', [{time: 'Office Hours', number: '+250 280 301 000'}, {time: 'After Hours', number: '+250 788 351 000'}, {time: 'Alternate After Hours', number: ''} ]),
      new Country(3, 'Botswana', [{time: 'Office Hours', number: '+27 82 873 0791'}, {time: 'Alternate After Hours', number: '+27 82 601 7046'}, {time: 'After Hours', number: '' } ]),
      new Country(4, 'Zambia', [{time: 'Office Hours', number: '+260 211 262061'}, {time: 'After Hours', number: '+260 211 262061' }, {time: 'Alternate After Hours', number: '' }]),
      new Country(5, 'Zimbabwe', [{time: 'Office Hours', number: '+27 82 873 0791'}, {time: 'After Hours', number: '+27 82 601 7046'}, {time: 'After Hours', number: '' } ]),
      new Country(6, 'South Africa', [{time: 'Office Hours', number: '+27 82 873 0791'}, {time: 'After Hours', number: '+27 82 601 7046'}, {time: 'After Hours', number: '' } ]),
      new Country(7, 'Zanzibar', [{time: 'Office Hours', number: '+255 784 999 736'}, {time: 'After Hours', number: '+255 784 666 510'}, {time: 'Alternate After Hours', number: '+27 72 710 4045'} ]),
      new Country(8, 'Malawi', [{time: 'Office Hours', number: '+27214181515'}, {time: 'After Hours', number: '+27214181515'}, {time: 'Alternate After Hours', number: '+27214181515'} ]),
      new Country(9, 'Mozambique', [{time: 'Office Hours', number: '+27214181515'}, {time: 'After Hours', number: '+27214181515'}, {time: 'Alternate After Hours', number: '+27214181515'} ]),
      new Country(10, 'Kenya', [{time: 'Office Hours', number: '+254 790 406 230'}, {time: 'After Hours', number: '+254 713 399 018'}, {time: 'Alternate After Hours', number: '+27 72 710 4045'} ]),
      new Country(11, 'Namibia', [{time: 'Office Hours', number: '+264 67 303 200'}, {time: 'After Hours', number: '+264 81 269 7271'}, {time: 'After Hours', number: '' } ]),
      new Country(12, 'Uganda', [{time: 'Office Hours', number: '+256 777 284 831'}, {time: 'After Hours', number: '+250 788 351 000'}, {time: 'Alternate After Hours', number: ''} ])
    ];
  }

  // function to generate regions array
  getRegions() {
    return [
      // zanzibar regions
      new Region(1, 7, 'Stone Town'),
      new Region(2, 7, 'North East Coast'),
      new Region(3, 7, 'North West Coast'), // TODO: this is not in the real list
      new Region(4, 7, 'South Coast'),
      new Region(5, 7, 'North Coast'),
      new Region(6, 7, 'East Coast'),
      new Region(7, 7, 'Pemba Island'),
      new Region(8, 7, 'Other'),

      // tanzania regions
      new Region(9, 1, 'Arusha + Kilimanjaro'),
      new Region(10, 1, 'Tarangire'),
      new Region(11, 1, 'Karatu + Ngorongoro'),
      new Region(12, 1, 'Southern Serengeti'),
      new Region(13, 1, 'Northern Serengeti'),
      new Region(14, 1, 'Central Serengeti'),
      new Region(15, 1, 'East + West Serengeti'),
      new Region(16, 1, 'Ruaha'),
      new Region(17, 1, 'Western Tanzania'),
      new Region(18, 1, 'Selous'),
      new Region(19, 1, 'Tanzanian Coast'),
      new Region(20, 1, 'Other'),

      // kenya regions
      new Region(21, 10, 'Nairobi'),
      new Region(22, 10, 'Amboseli + Chyulu'),
      new Region(23, 10, 'Greater Maasai Mara'),
      new Region(24, 10, 'Laikipia'),
      new Region(25, 10, 'Samburu'),
      new Region(26, 10, 'Kenyan Coast'),
      new Region(27, 10, 'Other'),

      // botswana regions
      new Region(28, 3, 'Okavango Delta'),
      new Region(29, 3, 'Pans'),
      new Region(30, 3, 'Chobe'),

      // zimbabwe regions
      new Region(31, 5, 'Hwange NP'),
      new Region(32, 5, 'Mana Pools'),
      new Region(33, 5, 'Victoria Falls'),
      new Region(34, 5, 'Other'),

      // zambia regions
      new Region(35, 4, 'Lower Zambezi'),
      new Region(36, 4, 'South Luangwa'),
      new Region(37, 4, 'Lusaka'),
      new Region(38, 4, 'Livingstone (Vic Falls)'),
      new Region(39, 4, 'Other'),

      // south africa regions
      new Region(40, 6, 'Cape Town'),
      new Region(41, 6, 'Winelands'),
      new Region(42, 6, 'Kruger / Sabi Sands'),
      new Region(43, 6, 'Garden Route / Eastern Cape'),
      new Region(44, 6, 'KZN'),
      new Region(45, 6, 'Other'),

      // mozambique regions
      new Region(46, 9, 'Bazaruto'),
      new Region(47, 9, 'Quirimbas'),
      new Region(48, 9, 'Other'),

      // Malawi regions
      new Region(49, 8, 'Lake Malawi'),
      new Region(50, 8, 'Other'),

      // Rwanda regions
      new Region(51, 2, 'Kigali'),
      new Region(52, 2, 'Entebbe'),
      new Region(53, 2, 'Volcanoes NP'),
      new Region(54, 2, 'Bwindi NP'),
      new Region(55, 2, 'Gihinga NP'),
      new Region(56, 2, 'Other'),

      // Uganda regions
      new Region(51, 12, 'Kigali'),
      new Region(52, 12, 'Entebbe'),
      new Region(53, 12, 'Volcanoes NP'),
      new Region(54, 12, 'Bwindi NP'),
      new Region(55, 12, 'Gihinga NP'),
      new Region(56, 12, 'Other'),

      // namibia regoins
      new Region(57, 11, 'Namibia'),
    ];
  }

  // function to diplay destination names
  getDestination(id: string) {
    // return destination name
    const d = this.getCountries().find((item) => {
      return item.id === parseInt(id, 10);
    });
    return d;
  }

  constructor() {
  }
}
