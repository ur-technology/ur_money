import { Injectable } from '@angular/core';


@Injectable()

export class CountryListService {
  /**
   *
   */
  countries: any;
  constructor() {
    this.populateCountries();
  }


  getCountryData() {
    return this.countries;
  }

  getDefaultContry(): any {
    return this.countries.find((x) => { return x.countryCode === 'US'; });
  }

  populateCountries() {
    this.countries = [
      {
        'telephoneCountryCode': '+93',
        'name': 'Afghanistan',
        'countryCode': 'AF'
      },
      {
        'telephoneCountryCode': '+355',
        'name': 'Albania',
        'countryCode': 'AL'
      },
      {
        'telephoneCountryCode': '+213',
        'name': 'Algeria',
        'countryCode': 'DZ'
      },
      {
        'telephoneCountryCode': '+1 684',
        'name': 'American Samoa',
        'countryCode': 'AS'
      },
      {
        'telephoneCountryCode': '+376',
        'name': 'Andorra',
        'countryCode': 'AD'
      },
      {
        'telephoneCountryCode': '+244',
        'name': 'Angola',
        'countryCode': 'AO'
      },
      {
        'telephoneCountryCode': '+1 264',
        'name': 'Anguilla',
        'countryCode': 'AI'
      },
      {
        'telephoneCountryCode': '+1 268',
        'name': 'Antigua and Barbuda',
        'countryCode': 'AG'
      },
      {
        'telephoneCountryCode': '+54',
        'name': 'Argentina',
        'countryCode': 'AR'
      },
      {
        'telephoneCountryCode': '+374',
        'name': 'Armenia',
        'countryCode': 'AM'
      },
      {
        'telephoneCountryCode': '+297',
        'name': 'Aruba',
        'countryCode': 'AW'
      },
      {
        'telephoneCountryCode': '+61',
        'name': 'Australia',
        'countryCode': 'AU'
      },
      {
        'telephoneCountryCode': '+43',
        'name': 'Austria',
        'countryCode': 'AT'
      },
      {
        'telephoneCountryCode': '+994',
        'name': 'Azerbaijan',
        'countryCode': 'AZ'
      },
      {
        'telephoneCountryCode': '+1 242',
        'name': 'Bahamas',
        'countryCode': 'BS'
      },
      {
        'telephoneCountryCode': '+973',
        'name': 'Bahrain',
        'countryCode': 'BH'
      },
      {
        'telephoneCountryCode': '+880',
        'name': 'Bangladesh',
        'countryCode': 'BD'
      },
      {
        'telephoneCountryCode': '+1 246',
        'name': 'Barbados',
        'countryCode': 'BB'
      },
      {
        'telephoneCountryCode': '+375',
        'name': 'Belarus',
        'countryCode': 'BY'
      },
      {
        'telephoneCountryCode': '+32',
        'name': 'Belgium',
        'countryCode': 'BE'
      },
      {
        'telephoneCountryCode': '+501',
        'name': 'Belize',
        'countryCode': 'BZ'
      },
      {
        'telephoneCountryCode': '+229',
        'name': 'Benin',
        'countryCode': 'BJ'
      },
      {
        'telephoneCountryCode': '+1 441',
        'name': 'Bermuda',
        'countryCode': 'BM'
      },
      {
        'telephoneCountryCode': '+975',
        'name': 'Bhutan',
        'countryCode': 'BT'
      },
      {
        'telephoneCountryCode': '+591',
        'name': 'Bolivia',
        'countryCode': 'BO'
      },
      {
        'telephoneCountryCode': '+387',
        'name': 'Bosnia and Herzegovina',
        'countryCode': 'BA'
      },
      {
        'telephoneCountryCode': '+267',
        'name': 'Botswana',
        'countryCode': 'BW'
      },
      {
        'telephoneCountryCode': '+55',
        'name': 'Brazil',
        'countryCode': 'BR'
      },
      {
        'telephoneCountryCode': '+246',
        'name': 'British Indian Ocean Territory',
        'countryCode': 'IO'
      },
      {
        'telephoneCountryCode': '+1 284',
        'name': 'British Virgin Islands',
        'countryCode': 'VG'
      },
      {
        'telephoneCountryCode': '+673',
        'name': 'Brunei',
        'countryCode': 'BN'
      },
      {
        'telephoneCountryCode': '+359',
        'name': 'Bulgaria',
        'countryCode': 'BG'
      },
      {
        'telephoneCountryCode': '+226',
        'name': 'Burkina Faso',
        'countryCode': 'BG'
      },
      {
        'telephoneCountryCode': '+257',
        'name': 'Burundi',
        'countryCode': 'BI'
      },
      {
        'telephoneCountryCode': '+855',
        'name': 'Cambodia',
        'countryCode': 'KH'
      },
      {
        'telephoneCountryCode': '+237',
        'name': 'Cameroon',
        'countryCode': 'CM'
      },
      {
        'telephoneCountryCode': '+1',
        'name': 'Canada',
        'countryCode': 'CA'
      },
      {
        'telephoneCountryCode': '+238',
        'name': 'Cape Verde',
        'countryCode': 'CV'
      },
      {
        'telephoneCountryCode': '+599',
        'name': 'Caribbean Netherlands',
        'countryCode': 'BQ'
      },
      {
        'telephoneCountryCode': '+345',
        'name': 'Cayman Islands',
        'countryCode': 'KY'
      },
      {
        'telephoneCountryCode': '+236',
        'name': 'Central African Republic',
        'countryCode': 'CF'
      },
      {
        'telephoneCountryCode': '+235',
        'name': 'Chad',
        'countryCode': 'TD'
      },
      {
        'telephoneCountryCode': '+56',
        'name': 'Chile',
        'countryCode': 'CL'
      },
      {
        'telephoneCountryCode': '+86',
        'name': 'China',
        'countryCode': 'CN'
      },
      {
        'telephoneCountryCode': '+61',
        'name': 'Christmas Island',
        'countryCode': 'CX'
      },
      {
        'telephoneCountryCode': '+61',
        'name': 'Cocos-Keeling Islands',
        'countryCode': 'CC'
      },
      {
        'telephoneCountryCode': '+57',
        'name': 'Colombia',
        'countryCode': 'CO'
      },
      {
        'telephoneCountryCode': '+269',
        'name': 'Comoros',
        'countryCode': 'KM'
      },
      {
        'telephoneCountryCode': '+242',
        'name': 'Congo',
        'countryCode': 'CG'
      },
      {
        'telephoneCountryCode': '+243',
        'name': 'Congo, Dem. Rep. of (Zaire)',
        'countryCode': 'CD'
      },
      {
        'telephoneCountryCode': '+682',
        'name': 'Cook Islands',
        'countryCode': 'CK'
      },
      {
        'telephoneCountryCode': '+506',
        'name': 'Costa Rica',
        'countryCode': 'CR'
      },
      {
        'telephoneCountryCode': '+225',
        'name': 'Côte d’Ivoire',
        'countryCode': 'CI'
      },
      {
        'telephoneCountryCode': '+385',
        'name': 'Croatia',
        'countryCode': 'HR'
      },
      {
        'telephoneCountryCode': '+599',
        'name': 'Curacao',
        'countryCode': 'CW'
      },
      {
        'telephoneCountryCode': '+357',
        'name': 'Cyprus',
        'countryCode': 'CY'
      },
      {
        'telephoneCountryCode': '+420',
        'name': 'Czech Republic',
        'countryCode': 'CZ'
      },
      {
        'telephoneCountryCode': '+45',
        'name': 'Denmark',
        'countryCode': 'DK'
      },
      {
        'telephoneCountryCode': '+253',
        'name': 'Djibouti',
        'countryCode': 'DJ'
      },
      {
        'telephoneCountryCode': '+1 767',
        'name': 'Dominica',
        'countryCode': 'DM'
      },
      {
        'telephoneCountryCode': '+1 809',
        'name': 'Dominican Republic',
        'countryCode': 'DO'
      },
      {
        'telephoneCountryCode': '+593',
        'name': 'Ecuador',
        'countryCode': 'EC'
      },
      {
        'telephoneCountryCode': '+20',
        'name': 'Egypt',
        'countryCode': 'EG'
      },
      {
        'telephoneCountryCode': '+503',
        'name': 'El Salvador',
        'countryCode': 'SV'
      },
      {
        'telephoneCountryCode': '+240',
        'name': 'Equatorial Guinea',
        'countryCode': 'GQ'
      },
      {
        'telephoneCountryCode': '+291',
        'name': 'Eritrea',
        'countryCode': 'ER'
      },
      {
        'telephoneCountryCode': '+372',
        'name': 'Estonia',
        'countryCode': 'EE'
      },
      {
        'telephoneCountryCode': '+251',
        'name': 'Ethiopia',
        'countryCode': 'ET'
      },
      {
        'telephoneCountryCode': '+500',
        'name': 'Falkland Islands',
        'countryCode': 'FK'
      },
      {
        'telephoneCountryCode': '+298',
        'name': 'Faroe Islands',
        'countryCode': 'FO'
      },
      {
        'telephoneCountryCode': '+679',
        'name': 'Fiji',
        'countryCode': 'FJ'
      },
      {
        'telephoneCountryCode': '+358',
        'name': 'Finland',
        'countryCode': 'FI'
      },
      {
        'telephoneCountryCode': '+33',
        'name': 'France',
        'countryCode': 'FR'
      },
      {
        'telephoneCountryCode': '+596',
        'name': 'French Antilles',
        'countryCode': 'FR'
      },
      {
        'telephoneCountryCode': '+594',
        'name': 'French Guiana',
        'countryCode': 'GF'
      },
      {
        'telephoneCountryCode': '+689',
        'name': 'French Polynesia',
        'countryCode': 'PF'
      },
      {
        'telephoneCountryCode': '+241',
        'name': 'Gabon',
        'countryCode': 'GA'
      },
      {
        'telephoneCountryCode': '+220',
        'name': 'Gambia',
        'countryCode': 'GM'
      },
      {
        'telephoneCountryCode': '+995',
        'name': 'Georgia',
        'countryCode': 'GE'
      },
      {
        'telephoneCountryCode': '+49',
        'name': 'Germany',
        'countryCode': 'DE'
      },
      {
        'telephoneCountryCode': '+233',
        'name': 'Ghana',
        'countryCode': 'GH'
      },
      {
        'telephoneCountryCode': '+350',
        'name': 'Gibraltar',
        'countryCode': 'GI'
      },
      {
        'telephoneCountryCode': '+30',
        'name': 'Greece',
        'countryCode': 'GR'
      },
      {
        'telephoneCountryCode': '+299',
        'name': 'Greenland',
        'countryCode': 'GL'
      },
      {
        'telephoneCountryCode': '+1 473',
        'name': 'Grenada',
        'countryCode': 'GD'
      },
      {
        'telephoneCountryCode': '+590',
        'name': 'Guadeloupe',
        'countryCode': 'GP'
      },
      {
        'telephoneCountryCode': '+1 671',
        'name': 'Guam',
        'countryCode': 'GU'
      },
      {
        'telephoneCountryCode': '+502',
        'name': 'Guatemala',
        'countryCode': 'GT'
      },
      {
        'telephoneCountryCode': '+224',
        'name': 'Guinea',
        'countryCode': 'GN'
      },
      {
        'telephoneCountryCode': '+245',
        'name': 'Guinea-Bissau',
        'countryCode': 'GW'
      },
      {
        'telephoneCountryCode': '+595',
        'name': 'Guyana',
        'countryCode': 'GY'
      },
      {
        'telephoneCountryCode': '+509',
        'name': 'Haiti',
        'countryCode': 'HT'
      },
      {
        'telephoneCountryCode': '+504',
        'name': 'Honduras',
        'countryCode': 'HN'
      },
      {
        'telephoneCountryCode': '+852',
        'name': 'Hong Kong SAR China',
        'countryCode': 'HK'
      },
      {
        'telephoneCountryCode': '+36',
        'name': 'Hungary',
        'countryCode': 'HU'
      },
      {
        'telephoneCountryCode': '+354',
        'name': 'Iceland',
        'countryCode': 'IS'
      },
      {
        'telephoneCountryCode': '+91',
        'name': 'India',
        'countryCode': 'IN'
      },
      {
        'telephoneCountryCode': '+62',
        'name': 'Indonesia',
        'countryCode': 'ID'
      },
      {
        'telephoneCountryCode': '+964',
        'name': 'Iraq',
        'countryCode': 'IQ'
      },
      {
        'telephoneCountryCode': '+353',
        'name': 'Ireland',
        'countryCode': 'IR'
      },
      {
        'telephoneCountryCode': '+44',
        'name': 'Isle of Man',
        'countryCode': 'IM'
      },
      {
        'telephoneCountryCode': '+972',
        'name': 'Israel',
        'countryCode': 'IL'
      },
      {
        'telephoneCountryCode': '+39',
        'name': 'Italy',
        'countryCode': 'IT'
      },
      {
        'telephoneCountryCode': '+1 876',
        'name': 'Jamaica',
        'countryCode': 'JM'
      },
      {
        'telephoneCountryCode': '+81',
        'name': 'Japan',
        'countryCode': 'JP'
      },
      {
        'telephoneCountryCode': '+962',
        'name': 'Jordan',
        'countryCode': 'JO'
      },
      {
        'telephoneCountryCode': '+77',
        'name': 'Kazakhstan',
        'countryCode': 'KZ'
      },
      {
        'telephoneCountryCode': '+254',
        'name': 'Kenya',
        'countryCode': 'KE'
      },
      {
        'telephoneCountryCode': '+686',
        'name': 'Kiribati',
        'countryCode': 'KI'
      },
      {
        'telephoneCountryCode': '+965',
        'name': 'Kuwait',
        'countryCode': 'KW'
      },
      {
        'telephoneCountryCode': '+996',
        'name': 'Kyrgyzstan',
        'countryCode': 'KG'
      },
      {
        'telephoneCountryCode': '+856',
        'name': 'Laos',
        'countryCode': 'LA'
      },
      {
        'telephoneCountryCode': '+371',
        'name': 'Latvia',
        'countryCode': 'LV'
      },
      {
        'telephoneCountryCode': '+961',
        'name': 'Lebanon',
        'countryCode': 'LB'
      },
      {
        'telephoneCountryCode': '+266',
        'name': 'Lesotho',
        'countryCode': 'LS'
      },
      {
        'telephoneCountryCode': '+231',
        'name': 'Liberia',
        'countryCode': 'LR'
      },
      {
        'telephoneCountryCode': '+218',
        'name': 'Libya',
        'countryCode': 'LY'
      },
      {
        'telephoneCountryCode': '+423',
        'name': 'Liechtenstein',
        'countryCode': 'LI'
      },
      {
        'telephoneCountryCode': '+370',
        'name': 'Lithuania',
        'countryCode': 'LT'
      },
      {
        'telephoneCountryCode': '+352',
        'name': 'Luxembourg',
        'countryCode': 'LU'
      },
      {
        'telephoneCountryCode': '+853',
        'name': 'Macau SAR China',
        'countryCode': 'MO'
      },
      {
        'telephoneCountryCode': '+389',
        'name': 'Macedonia',
        'countryCode': 'MK'
      },
      {
        'telephoneCountryCode': '+261',
        'name': 'Madagascar',
        'countryCode': 'MG'
      },
      {
        'telephoneCountryCode': '+265',
        'name': 'Malawi',
        'countryCode': 'MW'
      },
      {
        'telephoneCountryCode': '+60',
        'name': 'Malaysia',
        'countryCode': 'MY'
      },
      {
        'telephoneCountryCode': '+960',
        'name': 'Maldives',
        'countryCode': 'MV'
      },
      {
        'telephoneCountryCode': '+223',
        'name': 'Mali',
        'countryCode': 'ML'
      },
      {
        'telephoneCountryCode': '+356',
        'name': 'Malta',
        'countryCode': 'MT'
      },
      {
        'telephoneCountryCode': '+692',
        'name': 'Marshall Islands',
        'countryCode': 'MH'
      },
      {
        'telephoneCountryCode': '+596',
        'name': 'Martinique',
        'countryCode': 'MQ'
      },
      {
        'telephoneCountryCode': '+222',
        'name': 'Mauritania',
        'countryCode': 'MR'
      },
      {
        'telephoneCountryCode': '+230',
        'name': 'Mauritius',
        'countryCode': 'MU'
      },
      {
        'telephoneCountryCode': '+262',
        'name': 'Mayotte',
        'countryCode': 'YT'
      },
      {
        'telephoneCountryCode': '+52',
        'name': 'Mexico',
        'countryCode': 'MX',
        'mobileAreaCodePrefix': '1'
      },
      {
        'telephoneCountryCode': '+691',
        'name': 'Micronesia',
        'countryCode': 'FM'
      },
      {
        'telephoneCountryCode': '+373',
        'name': 'Moldova',
        'countryCode': 'MD'
      },
      {
        'telephoneCountryCode': '+377',
        'name': 'Monaco',
        'countryCode': 'MC'
      },
      {
        'telephoneCountryCode': '+976',
        'name': 'Mongolia',
        'countryCode': 'MN'
      },
      {
        'telephoneCountryCode': '+382',
        'name': 'Montenegro',
        'countryCode': 'ME'
      },
      {
        'telephoneCountryCode': '+1664',
        'name': 'Montserrat',
        'countryCode': 'MS'
      },
      {
        'telephoneCountryCode': '+212',
        'name': 'Morocco',
        'countryCode': 'MA'
      },
      {
        'telephoneCountryCode': '+258',
        'name': 'Mozambique',
        'countryCode': 'MZ'
      },
      {
        'telephoneCountryCode': '+95',
        'name': 'Myanmar',
        'countryCode': 'MM'
      },
      {
        'telephoneCountryCode': '+264',
        'name': 'Namibia',
        'countryCode': 'NA'
      },
      {
        'telephoneCountryCode': '+674',
        'name': 'Nauru',
        'countryCode': 'NR'
      },
      {
        'telephoneCountryCode': '+977',
        'name': 'Nepal',
        'countryCode': 'NP'
      },
      {
        'telephoneCountryCode': '+31',
        'name': 'Netherlands',
        'countryCode': 'NL'
      },
      {
        'telephoneCountryCode': '+599',
        'name': 'Netherlands Antilles',
        'countryCode': 'NC'
      },
      {
        'telephoneCountryCode': '+64',
        'name': 'New Zealand',
        'countryCode': 'NZ'
      },
      {
        'telephoneCountryCode': '+505',
        'name': 'Nicaragua',
        'countryCode': 'NI'
      },
      {
        'telephoneCountryCode': '+227',
        'name': 'Niger',
        'countryCode': 'NE'
      },
      {
        'telephoneCountryCode': '+234',
        'name': 'Nigeria',
        'countryCode': 'NG'
      },
      {
        'telephoneCountryCode': '+683',
        'name': 'Niue',
        'countryCode': 'NU'
      },
      {
        'telephoneCountryCode': '+672',
        'name': 'Norfolk Island',
        'countryCode': 'NF'
      },
      {
        'telephoneCountryCode': '+1 670',
        'name': 'Northern Mariana Islands',
        'countryCode': 'MP'
      },
      {
        'telephoneCountryCode': '+47',
        'name': 'Norway',
        'countryCode': 'NO'
      },
      {
        'telephoneCountryCode': '+968',
        'name': 'Oman',
        'countryCode': 'OM'
      },
      {
        'telephoneCountryCode': '+92',
        'name': 'Pakistan',
        'countryCode': 'PK'
      },
      {
        'telephoneCountryCode': '+680',
        'name': 'Palau',
        'countryCode': 'PW'
      },
      {
        'telephoneCountryCode': '+970',
        'name': 'Palestinian Territory',
        'countryCode': 'PS'
      },
      {
        'telephoneCountryCode': '+507',
        'name': 'Panama',
        'countryCode': 'PA'
      },
      {
        'telephoneCountryCode': '+675',
        'name': 'Papua New Guinea',
        'countryCode': 'PG'
      },
      {
        'telephoneCountryCode': '+595',
        'name': 'Paraguay',
        'countryCode': 'PY'
      },
      {
        'telephoneCountryCode': '+51',
        'name': 'Peru',
        'countryCode': 'PE'
      },
      {
        'telephoneCountryCode': '+63',
        'name': 'Philippines',
        'countryCode': 'PH'
      },
      {
        'telephoneCountryCode': '+48',
        'name': 'Poland',
        'countryCode': 'PL'
      },
      {
        'telephoneCountryCode': '+351',
        'name': 'Portugal',
        'countryCode': 'PT'
      },
      {
        'telephoneCountryCode': '+1 787',
        'name': 'Puerto Rico',
        'countryCode': 'PR'
      },
      {
        'telephoneCountryCode': '+974',
        'name': 'Qatar',
        'countryCode': 'QA'
      },
      {
        'telephoneCountryCode': '+262',
        'name': 'Reunion',
        'countryCode': 'RE'
      },
      {
        'telephoneCountryCode': '+40',
        'name': 'Romania',
        'countryCode': 'RO'
      },
      {
        'telephoneCountryCode': '+7',
        'name': 'Russia',
        'countryCode': 'RU'
      },
      {
        'telephoneCountryCode': '+250',
        'name': 'Rwanda',
        'countryCode': ''
      },
      {
        'telephoneCountryCode': '+685',
        'name': 'Samoa',
        'countryCode': 'WS'
      },
      {
        'telephoneCountryCode': '+378',
        'name': 'San Marino',
        'countryCode': 'SM'
      },
      {
        'telephoneCountryCode': '+966',
        'name': 'Saudi Arabia',
        'countryCode': 'SA'
      },
      {
        'telephoneCountryCode': '+221',
        'name': 'Senegal',
        'countryCode': 'SN'
      },
      {
        'telephoneCountryCode': '+381',
        'name': 'Serbia',
        'countryCode': 'RS'
      },
      {
        'telephoneCountryCode': '+248',
        'name': 'Seychelles',
        'countryCode': 'SC'
      },
      {
        'telephoneCountryCode': '+232',
        'name': 'Sierra Leone',
        'countryCode': 'SL'
      },
      {
        'telephoneCountryCode': '+65',
        'name': 'Singapore',
        'countryCode': 'SG'
      },
      {
        'telephoneCountryCode': '+421',
        'name': 'Slovakia',
        'countryCode': 'SK'
      },
      {
        'telephoneCountryCode': '+386',
        'name': 'Slovenia',
        'countryCode': 'SI'
      },
      {
        'telephoneCountryCode': '+677',
        'name': 'Solomon Islands',
        'countryCode': 'SB'
      },
      {
        'telephoneCountryCode': '+27',
        'name': 'South Africa',
        'countryCode': 'ZA'
      },
      {
        'telephoneCountryCode': '+82',
        'name': 'South Korea',
        'countryCode': 'KR'
      },
      {
        'telephoneCountryCode': '+34',
        'name': 'Spain',
        'countryCode': 'ES'
      },
      {
        'telephoneCountryCode': '+94',
        'name': 'Sri Lanka',
        'countryCode': 'LK'
      },
      {
        'telephoneCountryCode': '+597',
        'name': 'Suriname',
        'countryCode': 'SR'
      },
      {
        'telephoneCountryCode': '+268',
        'name': 'Swaziland',
        'countryCode': 'SZ'
      },
      {
        'telephoneCountryCode': '+46',
        'name': 'Sweden',
        'countryCode': 'SE'
      },
      {
        'telephoneCountryCode': '+41',
        'name': 'Switzerland',
        'countryCode': 'CH'
      },
      {
        'telephoneCountryCode': '+886',
        'name': 'Taiwan',
        'countryCode': 'TW'
      },
      {
        'telephoneCountryCode': '+992',
        'name': 'Tajikistan',
        'countryCode': 'TJ'
      },
      {
        'telephoneCountryCode': '+255',
        'name': 'Tanzania',
        'countryCode': 'TZ'
      },
      {
        'telephoneCountryCode': '+66',
        'name': 'Thailand',
        'countryCode': 'TH'
      },
      {
        'telephoneCountryCode': '+670',
        'name': 'Timor Leste',
        'countryCode': 'TL'
      },
      {
        'telephoneCountryCode': '+228',
        'name': 'Togo',
        'countryCode': 'TG'
      },
      {
        'telephoneCountryCode': '+690',
        'name': 'Tokelau',
        'countryCode': 'TK'
      },
      {
        'telephoneCountryCode': '+676',
        'name': 'Tonga',
        'countryCode': 'TO'
      },
      {
        'telephoneCountryCode': '+1 868',
        'name': 'Trinidad and Tobago',
        'countryCode': 'TT'
      },
      {
        'telephoneCountryCode': '+216',
        'name': 'Tunisia',
        'countryCode': 'TN'
      },
      {
        'telephoneCountryCode': '+90',
        'name': 'Turkey',
        'countryCode': 'TR'
      },
      {
        'telephoneCountryCode': '+993',
        'name': 'Turkmenistan',
        'countryCode': 'TM'
      },
      {
        'telephoneCountryCode': '+1 649',
        'name': 'Turks and Caicos Islands',
        'countryCode': 'TC'
      },
      {
        'telephoneCountryCode': '+688',
        'name': 'Tuvalu',
        'countryCode': 'TV'
      },
      {
        'telephoneCountryCode': '+1 340',
        'name': 'U.S. Virgin Islands',
        'countryCode': 'VI'
      },
      {
        'telephoneCountryCode': '+256',
        'name': 'Uganda',
        'countryCode': 'UG'
      },
      {
        'telephoneCountryCode': '+380',
        'name': 'Ukraine',
        'countryCode': 'UA'
      },
      {
        'telephoneCountryCode': '+44',
        'name': 'United Kingdom',
        'countryCode': 'GB'
      },
      {
        'telephoneCountryCode': '+971',
        'name': 'United Arab Emirates',
        'countryCode': 'AE'
      },
      {
        'telephoneCountryCode': '+1',
        'name': 'United States',
        'countryCode': 'US'
      },
      {
        'telephoneCountryCode': '+598',
        'name': 'Uruguay',
        'countryCode': 'UY'
      },
      {
        'telephoneCountryCode': '+998',
        'name': 'Uzbekistan',
        'countryCode': 'UZ'
      },
      {
        'telephoneCountryCode': '+678',
        'name': 'Vanuatu',
        'countryCode': 'VU'
      },
      {
        'telephoneCountryCode': '+58',
        'name': 'Venezuela',
        'countryCode': 'VE'
      },
      {
        'telephoneCountryCode': '+84',
        'name': 'Vietnam',
        'countryCode': 'VN'
      },
      {
        'telephoneCountryCode': '+681',
        'name': 'Wallis and Futuna',
        'countryCode': 'WF'
      },
      {
        'telephoneCountryCode': '+967',
        'name': 'Yemen',
        'countryCode': 'YE'
      },
      {
        'telephoneCountryCode': '+260',
        'name': 'Zambia',
        'countryCode': 'ZM'
      },
      {
        'telephoneCountryCode': '+263',
        'name': 'Zimbabwe',
        'countryCode': 'ZW'
      }
    ];
  }
}
