export class FakeContactsSource {

  constructor() {
  }

  static find(params: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      resolve(FakeContactsSource.rawContacts());
    });
  };

  private static rawContacts(): any[] {
    return [
      {
        'name': {
          'givenName': 'Eiland',
          'familyName': 'Glover'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2Favatar-40.jpg?alt=media&token=a2226754-081c-43ea-98e4-48870877a253',
        'phoneNumbers': [{
          'id': '1',
          'pref': false,
          'value': '+16158566616',
          'type': 'mobile'
        }],
        'id': '1'
      }, {
        'name': {
          'givenName': 'John',
          'familyName': 'Reitano'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2Favatar-6.jpg?alt=media&token=9c4b1623-9971-40cb-8aa0-74bf2188e028',
        'phoneNumbers': [{
          'id': '2',
          'pref': false,
          'value': '+16196746211',
          'type': 'mobile'
        }],
        'id': '2'
      },  {
        'name': {
          'givenName': 'TestFirstname',
          'familyName': 'TestLastname'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2Favatar-35.jpg?alt=media&token=c792966a-043c-4a02-9a31-58ea9b8715ed',
        'phoneNumbers': [{
          'id': '44',
          'pref': false,
          'value': '+16193611786',
          'type': 'mobile'
        }],
        'id': '44'
      }, {
        'name': {
          'givenName': 'Xavier',
          'familyName': 'Pérez'
        },
        'phoneNumbers': [{
            'id': '186',
            'pref': false,
            'value': '+593998016833',
            'type': 'mobile'
        }],
        'id': '20'

      }, {
        'name': {
          'givenName': 'Horacio',
          'familyName': 'Pérez'
        },
        'phoneNumbers': [{
          'id': '184',
          'pref': false,
          'value': '+593998739913',
          'type': 'mobile'
        }],
        'id': '21'
      }, {
        'name': {
          'givenName': 'Alpha',
          'familyName': 'Andrews'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '40',
          'pref': false,
          'value': '+16197778001',
          'type': 'mobile'
        }],
        'id': '7'
      }, {
        'name': {
          'givenName': 'Beta',
          'familyName': 'Brown'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '70',
          'pref': false,
          'value': '+16197778002',
          'type': 'home'
        }, {
            'id': '72',
            'pref': false,
            'value': '+16197778004',
            'type': 'mobile'
          }, {
            'id': '73',
            'pref': false,
            'value': '+16197778005',
            'type': 'work'
          }],
        'id': '8'
      }, {
        'name': {
          'givenName': 'Gamma',
          'familyName': 'Gallant'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '95',
          'pref': false,
          'value': '+16197778006',
          'type': 'mobile'
        }],
        'id': '9'
      }, {
        'name': {
          'givenName': 'Delta',
          'familyName': 'Daniels'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '197',
          'pref': false,
          'value': '+16197778007',
          'type': 'home'
        }, {
            'id': '199',
            'pref': false,
            'value': '+16197778008',
            'type': 'mobile'
          }],
        'id': '10'
      }, {
        'name': {
          'givenName': 'Epsilon',
          'familyName': 'Ellison'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '152',
          'pref': false,
          'value': '+16197778009',
          'type': 'mobile'
        }],
        'id': '13'
      }, {
        'name': {
          'givenName': 'Zeta',
          'familyName': 'Zenderson'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '49',
          'pref': false,
          'value': '+16197778010',
          'type': 'mobile'
        }],
        'id': '16'
      }, {
        'name': {
          'givenName': 'Eta',
          'familyName': 'Edwards'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '232',
          'pref': false,
          'value': '+16197778011',
          'type': 'mobile'
        }],
        'id': '17'
      }, {
        'name': {
          'givenName': 'Theta',
          'familyName': 'Thierry'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '222',
          'pref': false,
          'value': '+16197778012',
          'type': 'mobile'
        }],
        'id': '18'
      }, {
        'name': {
          'givenName': 'Iota',
          'familyName': 'Immerson'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '140',
          'pref': false,
          'value': '+16197778013',
          'type': 'home'
        }, {
            'id': '142',
            'pref': false,
            'value': '+16197778014',
            'type': 'mobile'
          }],
        'id': '19'
      }, {
        'name': {
          'givenName': 'Kappa',
          'familyName': 'Krell'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '84',
          'pref': false,
          'value': '+16197778015',
          'type': 'home'
        }, {
            'id': '86',
            'pref': false,
            'value': '+16197778016',
            'type': 'mobile'
          }],
        'id': '20'
      }, {
        'name': {
          'givenName': 'Lambda',
          'familyName': 'Landau'
        },
        'phoneNumbers': [{
          'id': '184',
          'pref': false,
          'value': '+5216643332222',
          'type': 'mobile'
        }, {
            'id': '186',
            'pref': false,
            'value': '+5216643332223',
            'type': 'mobile'
          }],
        'id': '21'
      }, {
        'name': {
          'givenName': 'Staci',
          'familyName': 'Glover'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '187',
          'pref': false,
          'value': '+16159746651',
          'type': 'mobile'
          }],
        'id': '22'
      }, {
        'name': {
          'givenName': 'Kappa',
          'familyName': 'Krell'
        },
        'profilePhotoUrl': 'https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117',
        'phoneNumbers': [{
          'id': '84',
          'pref': false,
          'value': '+16197778015',
          'type': 'home'
        }, {
          'id': '86',
          'pref': false,
          'value': '+16197778016',
          'type': 'mobile'
        }],
        'id': '23'
      }
    ];
  }
}
