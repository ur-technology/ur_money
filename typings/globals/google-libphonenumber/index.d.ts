// Generated by typings
// Source: https://raw.githubusercontent.com/mrshaq/typed-google-libphonenumber/509c353ce18df06da5e073881203a1b444cb57ca/node.d.ts
declare namespace libphonenumber {
    export interface PhoneNumber {}

    export class PhoneNumberUtil {

        static getInstance(): PhoneNumberUtil;

        format(number: PhoneNumber, numberFormat: PhoneNumberFormat): String;
        parse(numberToParse: String, defaultRegion: String): PhoneNumber;
        isValidNumber(number: PhoneNumber): Boolean;
        isValidNumberForRegion(number: PhoneNumber, regionCode: String): Boolean;
    }

    export class PhoneNumberFormat {
        static E164: PhoneNumberFormat;
        static INTERNATIONAL: PhoneNumberFormat;
        static NATIONAL: PhoneNumberFormat;
        static RFC3966: PhoneNumberFormat;
    }
}

declare module 'google-libphonenumber' {
    export = libphonenumber;
}