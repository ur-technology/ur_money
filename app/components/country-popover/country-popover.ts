import {Component, EventEmitter} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {CountryPopoverService} from './country-popover.service';
import {FilterPipe} from '../../pipes/filterPipe';
import {Focuser} from '../focuser/focuser';
/*
  Generated class for the CountryPopover component.

  See https://angular.io/docs/ts/latest/api/core/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  pipes: [FilterPipe],
  directives: [Focuser],
  selector: 'country-popover',
  templateUrl: 'build/components/country-popover/country-popover.html'
})
export class CountryPopover {
  countries: any;
  constructor(public countryPopoverService: CountryPopoverService, public viewController: ViewController) {
    this.populateCountries();
  }

  countrySelect(country) {
    this.countryPopoverService.countrySelected(country);
    this.viewController.dismiss();
  }

  populateCountries() {
    this.countries = [
      {
        'code': '+93',
        'name': 'Afghanistan',
        'iso': 'AF'
      },
      {
        'code': '+355',
        'name': 'Albania',
        'iso': 'AL'
      },
      {
        'code': '+213',
        'name': 'Algeria',
        'iso': 'DZ'
      },
      {
        'code': '+1 684',
        'name': 'American Samoa',
        'iso': 'AS'
      },
      {
        'code': '+376',
        'name': 'Andorra',
        'iso': 'AD'
      },
      {
        'code': '+244',
        'name': 'Angola',
        'iso': 'AO'
      },
      {
        'code': '+1 264',
        'name': 'Anguilla',
        'iso': 'AI'
      },
      {
        'code': '+1 268',
        'name': 'Antigua and Barbuda',
        'iso': 'AG'
      },
      {
        'code': '+54',
        'name': 'Argentina',
        'iso': 'AR'
      },
      {
        'code': '+374',
        'name': 'Armenia',
        'iso': 'AM'
      },
      {
        'code': '+297',
        'name': 'Aruba',
        'iso': 'AW'
      },
      {
        'code': '+61',
        'name': 'Australia',
        'iso': 'AU'
      },
      {
        'code': '+994',
        'name': 'Azerbaijan',
        'iso': 'AZ'
      },
      {
        'code': '+1 242',
        'name': 'Bahamas',
        'iso': 'BS'
      },
      {
        'code': '+973',
        'name': 'Bahrain',
        'iso': 'BH'
      },
      {
        'code': '+880',
        'name': 'Bangladesh',
        'iso': 'BD'
      },
      {
        'code': '+1 246',
        'name': 'Barbados',
        'iso': 'BB'
      },
      {
        'code': '+375',
        'name': 'Belarus',
        'iso': 'By'
      },
      {
        'code': '+32',
        'name': 'Belgium',
        'iso': 'BE'
      },
      {
        'code': '+501',
        'name': 'Belize',
        'iso': 'BZ'
      },
      {
        'code': '+229',
        'name': 'Benin',
        'iso': 'BJ'
      },
      {
        'code': '+1 441',
        'name': 'Bermuda',
        'iso': 'BM'
      },
      {
        'code': '+975',
        'name': 'Bhutan',
        'iso': 'BT'
      },
      {
        'code': '+591',
        'name': 'Bolivia',
        'iso': 'BO'
      },
      {
        'code': '+387',
        'name': 'Bosnia and Herzegovina',
        'iso': 'BA'
      },
      {
        'code': '+267',
        'name': 'Botswana',
        'iso': 'BW'
      },
      {
        'code': '+55',
        'name': 'Brazil',
        'iso': 'BR'
      },
      {
        'code': '+246',
        'name': 'British Indian Ocean Territory',
        'iso': 'IO'
      },
      {
        'code': '+1 284',
        'name': 'British Virgin Islands',
        'iso': 'VG'
      },
      {
        'code': '+673',
        'name': 'Brunei',
        'iso': 'BN'
      },
      {
        'code': '+359',
        'name': 'Bulgaria',
        'iso': 'BG'
      },
      {
        'code': '+226',
        'name': 'Burkina Faso',
        'iso': 'BG'
      },
      {
        'code': '+257',
        'name': 'Burundi',
        'iso': 'BI'
      },
      {
        'code': '+855',
        'name': 'Cambodia',
        'iso': 'KH'
      },
      {
        'code': '+237',
        'name': 'Cameroon',
        'iso': 'CM'
      },
      {
        'code': '+1',
        'name': 'Canada',
        'iso': 'CA'
      },
      {
        'code': '+238',
        'name': 'Cape Verde',
        'iso': 'CV'
      },
      {
        'code': '+599',
        'name': '"Caribbean Netherlands',
        'iso': 'BQ'
      },
      {
        'code': '+ 345',
        'name': 'Cayman Islands',
        'iso': 'KY'
      },
      {
        'code': '+236',
        'name': 'Central African Republic',
        'iso': 'CF'
      },
      {
        'code': '+235',
        'name': 'Chad',
        'iso': 'TD'
      },
      {
        'code': '+56',
        'name': 'Chile',
        'iso': 'CL'
      },
      {
        'code': '+86',
        'name': 'China',
        'iso': 'CN'
      },
      {
        'code': '+61',
        'name': 'Christmas Island',
        'iso': 'CX'
      },
      {
        'code': '+61',
        'name': 'Cocos-Keeling Islands',
        'iso': 'CC'
      },
      {
        'code': '+57',
        'name': 'Colombia',
        'iso': 'CO'
      },
      {
        'code': '+269',
        'name': 'Comoros',
        'iso': 'KM'
      },
      {
        'code': '+242',
        'name': 'Congo',
        'iso': 'CG'
      },
      {
        'code': '+243',
        'name': 'Congo, Dem. Rep. of (Zaire)',
        'iso': 'CD'
      },
      {
        'code': '+682',
        'name': 'Cook Islands',
        'iso': 'CK'
      },
      {
        'code': '+506',
        'name': 'Costa Rica',
        'iso': 'CR'
      },
      {
        'code': '+385',
        'name': 'Croatia',
        'iso': 'HR'
      },
      {
        'code': '+53',
        'name': 'Cuba',
        'iso': 'CU'
      },
      {
        'code': '+599',
        'name': 'Curacao',
        'iso': 'CW'
      },
      {
        'code': '+537',
        'name': 'Cyprus',
        'iso': 'CY'
      },
      {
        'code': '+420',
        'name': 'Czech Republic',
        'iso': 'CZ'
      },
      {
        'code': '+45',
        'name': 'Denmark',
        'iso': 'DK'
      },
      {
        'code': '+253',
        'name': 'Djibouti',
        'iso': 'DJ'
      },
      {
        'code': '+1 767',
        'name': 'Dominica',
        'iso': 'DM'
      },
      {
        'code': '+1 809',
        'name': 'Dominican Republic',
        'iso': 'DO'
      },
      {
        'code': '+593',
        'name': 'Ecuador',
        'iso': 'EC'
      },
      {
        'code': '+20',
        'name': 'Egypt',
        'iso': 'EG'
      },
      {
        'code': '+503',
        'name': 'El Salvador',
        'iso': 'SV'
      },
      {
        'code': '+240',
        'name': 'Equatorial Guinea',
        'iso': 'GQ'
      },
      {
        'code': '+291',
        'name': 'Eritrea',
        'iso': 'ER'
      },
      {
        'code': '+372',
        'name': 'Estonia',
        'iso': 'EE'
      },
      {
        'code': '+251',
        'name': 'Ethiopia',
        'iso': 'ET'
      },
      {
        'code': '+500',
        'name': 'Falkland Islands',
        'iso': 'FK'
      },
      {
        'code': '+298',
        'name': 'Faroe Islands',
        'iso': 'FO'
      },
      {
        'code': '+679',
        'name': 'Fiji',
        'iso': 'FJ'
      },
      {
        'code': '+358',
        'name': 'Finland',
        'iso': 'FI'
      },
      {
        'code': '+33',
        'name': 'France',
        'iso': 'FR'
      },
      {
        'code': '+596',
        'name': 'French Antilles',
        'iso': 'FR'
      },
      {
        'code': '+594',
        'name': 'French Guiana',
        'iso': 'GF'
      },
      {
        'code': '+689',
        'name': 'French Polynesia',
        'iso': 'PF'
      },
      {
        'code': '+241',
        'name': 'Gabon',
        'iso': 'GA'
      },
      {
        'code': '+220',
        'name': 'Gambia',
        'iso': 'GM'
      },
      {
        'code': '+995',
        'name': 'Georgia',
        'iso': 'GE'
      },
      {
        'code': '+49',
        'name': 'Germany',
        'iso': 'DE'
      },
      {
        'code': '+233',
        'name': 'Ghana',
        'iso': 'GH'
      },
      {
        'code': '+350',
        'name': 'Gibraltar',
        'iso': 'GI'
      },
      {
        'code': '+30',
        'name': 'Greece',
        'iso': 'GR'
      },
      {
        'code': '+299',
        'name': 'Greenland',
        'iso': 'GL'
      },
      {
        'code': '+1 473',
        'name': 'Grenada',
        'iso': 'GD'
      },
      {
        'code': '+590',
        'name': 'Guadeloupe',
        'iso': 'GP'
      },
      {
        'code': '+1 671',
        'name': 'Guam',
        'iso': 'GU'
      },
      {
        'code': '+502',
        'name': 'Guatemala',
        'iso': 'GT'
      },
      {
        'code': '+224',
        'name': 'Guinea',
        'iso': 'GN'
      },
      {
        'code': '+245',
        'name': 'Guinea-Bissau',
        'iso': 'GW'
      },
      {
        'code': '+595',
        'name': 'Guyana',
        'iso': 'GY'
      },
      {
        'code': '+509',
        'name': 'Haiti',
        'iso': 'HT'
      },
      {
        'code': '+504',
        'name': 'Honduras',
        'iso': 'HN'
      },
      {
        'code': '+852',
        'name': 'Hong Kong SAR China',
        'iso': 'HK'
      },
      {
        'code': '+36',
        'name': 'Hungary',
        'iso': 'HU'
      },
      {
        'code': '+354',
        'name': 'Iceland',
        'iso': 'IS'
      },
      {
        'code': '+91',
        'name': 'India',
        'iso': 'IN'
      },
      {
        'code': '+62',
        'name': 'Indonesia',
        'iso': 'ID'
      },
      {
        'code': '+98',
        'name': 'Iran',
        'iso': 'IR'
      },
      {
        'code': '+964',
        'name': 'Iraq',
        'iso': 'IQ'
      },
      {
        'code': '+353',
        'name': 'Ireland',
        'iso': 'IR'
      },
      {
        'code': '+44',
        'name': 'Isle of Man',
        'iso': 'IM'
      },
      {
        'code': '+972',
        'name': 'Israel',
        'iso': 'IL'
      },
      {
        'code': '+39',
        'name': 'Italy',
        'iso': 'IT'
      },
      {
        'code': '+1 876',
        'name': 'Jamaica',
        'iso': 'JM'
      },
      {
        'code': '+81',
        'name': 'Japan',
        'iso': 'JP'
      },
      {
        'code': '+962',
        'name': 'Jordan',
        'iso': 'JO'
      },
      {
        'code': '+77',
        'name': 'Kazakhstan',
        'iso': 'KZ'
      },
      {
        'code': '+254',
        'name': 'Kenya',
        'iso': 'KE'
      },
      {
        'code': '+686',
        'name': 'Kiribati',
        'iso': 'KI'
      },
      {
        'code': '+965',
        'name': 'Kuwait',
        'iso': 'KW'
      },
      {
        'code': '+996',
        'name': 'Kyrgyzstan',
        'iso': 'KG'
      },
      {
        'code': '+856',
        'name': 'Laos',
        'iso': 'LA'
      },
      {
        'code': '+371',
        'name': 'Latvia',
        'iso': 'LV'
      },
      {
        'code': '+961',
        'name': 'Lebanon',
        'iso': 'LB'
      },
      {
        'code': '+266',
        'name': 'Lesotho',
        'iso': 'LS'
      },
      {
        'code': '+231',
        'name': 'Liberia',
        'iso': 'LR'
      },
      {
        'code': '+218',
        'name': 'Libya',
        'iso': 'LY'
      },
      {
        'code': '+423',
        'name': 'Liechtenstein',
        'iso': 'LI'
      },
      {
        'code': '+370',
        'name': 'Lithuania',
        'iso': 'LT'
      },
      {
        'code': '+352',
        'name': 'Luxembourg',
        'iso': 'LU'
      },
      {
        'code': '+853',
        'name': 'Macau SAR China',
        'iso': 'MO'
      },
      {
        'code': '+389',
        'name': 'Macedonia',
        'iso': 'MK'
      },
      {
        'code': '+261',
        'name': 'Madagascar',
        'iso': 'MG'
      },
      {
        'code': '+265',
        'name': 'Malawi',
        'iso': 'MW'
      },
      {
        'code': '+60',
        'name': 'Malaysia',
        'iso': 'MY'
      },
      {
        'code': '+960',
        'name': 'Maldives',
        'iso': 'MV'
      },
      {
        'code': '+223',
        'name': 'Mali',
        'iso': 'ML'
      },
      {
        'code': '+356',
        'name': 'Malta',
        'iso': 'MT'
      },
      {
        'code': '+692',
        'name': 'Marshall Islands',
        'iso': 'MH'
      },
      {
        'code': '+596',
        'name': 'Martinique',
        'iso': 'MQ'
      },
      {
        'code': '+222',
        'name': 'Mauritania',
        'iso': 'MR'
      },
      {
        'code': '+230',
        'name': 'Mauritius',
        'iso': 'MU'
      },
      {
        'code': '+262',
        'name': 'Mayotte',
        'iso': 'YT'
      },
      {
        'code': '+52',
        'name': 'Mexico',
        'iso': 'MX'
      },
      {
        'code': '+691',
        'name': 'Micronesia',
        'iso': 'FM'
      },
      {
        'code': '+373',
        'name': 'Moldova',
        'iso': 'MD'
      },
      {
        'code': '+377',
        'name': 'Monaco',
        'iso': 'MC'
      },
      {
        'code': '+976',
        'name': 'Mongolia',
        'iso': 'MN'
      },
      {
        'code': '+382',
        'name': 'Montenegro',
        'iso': 'ME'
      },
      {
        'code': '+1664',
        'name': 'Montserrat',
        'iso': 'MS'
      },
      {
        'code': '+212',
        'name': 'Morocco',
        'iso': 'MA'
      },
      {
        'code': '+95',
        'name': 'Myanmar',
        'iso': 'MM'
      },
      {
        'code': '+264',
        'name': 'Namibia',
        'iso': 'NA'
      },
      {
        'code': '+674',
        'name': 'Nauru',
        'iso': 'NR'
      },
      {
        'code': '+977',
        'name': 'Nepal',
        'iso': 'NP'
      },
      {
        'code': '+31',
        'name': 'Netherlands',
        'iso': 'NL'
      },
      {
        'code': '+599',
        'name': 'Netherlands Antilles',
        'iso': 'NC'
      },
      {
        'code': '+64',
        'name': 'New Zealand',
        'iso': 'NZ'
      },
      {
        'code': '+505',
        'name': 'Nicaragua',
        'iso': 'NI'
      },
      {
        'code': '+227',
        'name': 'Niger',
        'iso': 'NE'
      },
      {
        'code': '+234',
        'name': 'Nigeria',
        'iso': 'NG'
      },
      {
        'code': '+683',
        'name': 'Niue',
        'iso': 'NU'
      },
      {
        'code': '+672',
        'name': 'Norfolk Island',
        'iso': 'NF'
      },
      {
        'code': '+850',
        'name': 'North Korea',
        'iso': 'KP'
      },
      {
        'code': '+1 670',
        'name': 'Northern Mariana Islands',
        'iso': 'MP'
      },
      {
        'code': '+47',
        'name': 'Norway',
        'iso': 'NO'
      },
      {
        'code': '+968',
        'name': 'Oman',
        'iso': 'OM'
      },
      {
        'code': '+92',
        'name': 'Pakistan',
        'iso': 'PK'
      },
      {
        'code': '+680',
        'name': 'Palau',
        'iso': 'PW'
      },
      {
        'code': '+970',
        'name': 'Palestinian Territory',
        'iso': 'PS'
      },
      {
        'code': '+507',
        'name': 'Panama',
        'iso': 'PA'
      },
      {
        'code': '+675',
        'name': 'Papua New Guinea',
        'iso': 'PG'
      },
      {
        'code': '+595',
        'name': 'Paraguay',
        'iso': 'PY'
      },
      {
        'code': '+51',
        'name': 'Peru',
        'iso': 'PE'
      },
      {
        'code': '+63',
        'name': 'Philippines',
        'iso': 'PH'
      },
      {
        'code': '+48',
        'name': 'Poland',
        'iso': 'PL'
      },
      {
        'code': '+351',
        'name': 'Portugal',
        'iso': 'PT'
      },
      {
        'code': '+1 787',
        'name': 'Puerto Rico',
        'iso': 'PR'
      },
      {
        'code': '+974',
        'name': 'Qatar',
        'iso': 'QA'
      },
      {
        'code': '+262',
        'name': 'Reunion',
        'iso': 'RE'
      },
      {
        'code': '+40',
        'name': 'Romania',
        'iso': 'RO'
      },
      {
        'code': '+7',
        'name': 'Russia',
        'iso': 'RU'
      },
      {
        'code': '+250',
        'name': 'Rwanda',
        'iso': ''
      },
      {
        'code': '+685',
        'name': 'Samoa',
        'iso': 'WS'
      },
      {
        'code': '+378',
        'name': 'San Marino',
        'iso': 'SM'
      },
      {
        'code': '+966',
        'name': 'Saudi Arabia',
        'iso': 'SA'
      },
      {
        'code': '+221',
        'name': 'Senegal',
        'iso': 'SN'
      },
      {
        'code': '+381',
        'name': 'Serbia',
        'iso': 'RS'
      },
      {
        'code': '+248',
        'name': 'Seychelles',
        'iso': 'SC'
      },
      {
        'code': '+232',
        'name': 'Sierra Leone',
        'iso': 'SL'
      },
      {
        'code': '+65',
        'name': 'Singapore',
        'iso': 'SG'
      },
      {
        'code': '+421',
        'name': 'Slovakia',
        'iso': 'SK'
      },
      {
        'code': '+386',
        'name': 'Slovenia',
        'iso': 'SI'
      },
      {
        'code': '+677',
        'name': 'Solomon Islands',
        'iso': 'SB'
      },
      {
        'code': '+27',
        'name': 'South Africa',
        'iso': 'ZA'
      },
      {
        'code': '+82',
        'name': 'South Korea',
        'iso': 'KR'
      },
      {
        'code': '+34',
        'name': 'Spain',
        'iso': 'ES'
      },
      {
        'code': '+94',
        'name': 'Sri Lanka',
        'iso': 'LK'
      },
      {
        'code': '+249',
        'name': 'Sudan',
        'iso': 'SD'
      },
      {
        'code': '+597',
        'name': 'Suriname',
        'iso': 'SR'
      },
      {
        'code': '+268',
        'name': 'Swaziland',
        'iso': 'SZ'
      },
      {
        'code': '+46',
        'name': 'Sweden',
        'iso': 'SE'
      },
      {
        'code': '+41',
        'name': 'Switzerland',
        'iso': 'CH'
      },
      {
        'code': '+963',
        'name': 'Syria',
        'iso': 'SY'
      },
      {
        'code': '+886',
        'name': 'Taiwan',
        'iso': 'TW'
      },
      {
        'code': '+992',
        'name': 'Tajikistan',
        'iso': 'TJ'
      },
      {
        'code': '+255',
        'name': 'Tanzania',
        'iso': 'TZ'
      },
      {
        'code': '+66',
        'name': 'Thailand',
        'iso': 'TH'
      },
      {
        'code': '+670',
        'name': 'Timor Leste',
        'iso': 'TL'
      },
      {
        'code': '+228',
        'name': 'Togo',
        'iso': 'TG'
      },
      {
        'code': '+690',
        'name': 'Tokelau',
        'iso': 'TK'
      },
      {
        'code': '+676',
        'name': 'Tonga',
        'iso': 'TO'
      },
      {
        'code': '+1 868',
        'name': 'Trinidad and Tobago',
        'iso': 'TT'
      },
      {
        'code': '+216',
        'name': 'Tunisia',
        'iso': 'TN'
      },
      {
        'code': '+90',
        'name': 'Turkey',
        'iso': 'TR'
      },
      {
        'code': '+993',
        'name': 'Turkmenistan',
        'iso': 'TM'
      },
      {
        'code': '+1 649',
        'name': 'Turks and Caicos Islands',
        'iso': 'TC'
      },
      {
        'code': '+688',
        'name': 'Tuvalu',
        'iso': 'TV'
      },
      {
        'code': '+1 340',
        'name': 'U.S. Virgin Islands',
        'iso': 'VI'
      },
      {
        'code': '+256',
        'name': 'Uganda',
        'iso': 'UG'
      },
      {
        'code': '+380',
        'name': 'Ukraine',
        'iso': 'UA'
      },
      {
        'code': '+44',
        'name': 'United Kingdom',
        'iso': 'GB'
      },
      {
        'code': '+971',
        'name': 'United Arab Emirates',
        'iso': 'AE'
      },
      {
        'code': '+1',
        'name': 'United States',
        'iso': 'US'
      },
      {
        'code': '+598',
        'name': 'Uruguay',
        'iso': 'UY'
      },
      {
        'code': '+998',
        'name': 'Uzbekistan',
        'iso': 'UZ'
      },
      {
        'code': '+678',
        'name': 'Vanuatu',
        'iso': 'VU'
      },
      {
        'code': '+58',
        'name': 'Venezuela',
        'iso': 'VE'
      },
      {
        'code': '+84',
        'name': 'Vietnam',
        'iso': 'VN'
      },
      {
        'code': '+681',
        'name': 'Wallis and Futuna',
        'iso': 'WF'
      },
      {
        'code': '+967',
        'name': 'Yemen',
        'iso': 'YE'
      },
      {
        'code': '+260',
        'name': 'Zambia',
        'iso': 'ZM'
      },
      {
        'code': '+263',
        'name': 'Zimbabwe',
        'iso': 'ZW'
      }
    ];
  }


}
