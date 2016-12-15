import {Injectable} from '@angular/core';

// declare var Encrypt = require('jsencrypt');

@Injectable()
export class EncryptionService {
  private pem: string = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOHO/1rr8jyjPFUsEdFZGQClZc' +
  'UsNP9ObWqc7bf3Sf5qHNteGdUERpNGszy69+SUuIjw2JeeOktzcgqwtnm9e2OTBg' +
  'RIHGim/tTD/28SyD5gId9eZd45xWzmUzCcF504Wel4L1lChEQxr9ypeaZxnL8b3e' +
  'KTMET7HiuXGC8kp1WQIDAQAB';
  private pvem: string = 'MIICXQIBAAKBgQDOHO/1rr8jyjPFUsEdFZGQClZcUsNP9ObWqc7bf3Sf5qHNteGd' +
  'UERpNGszy69+SUuIjw2JeeOktzcgqwtnm9e2OTBgRIHGim/tTD/28SyD5gId9eZd' +
  '45xWzmUzCcF504Wel4L1lChEQxr9ypeaZxnL8b3eKTMET7HiuXGC8kp1WQIDAQAB' +
  'AoGBAIDcDJWwG6X3i6hpFXzmeCvymo173MoHVa6NWVtXcwVpPm2KsbQVc7/GWuN2' +
  'C5DLqCKHNTJm9xCKzzdoWGf9Qb12yPxppFBIgIi4HLPes6dhErCaRuI/q2pFHaBx' +
  '4QYCIBi5FnDICD8OcgrHR1Y9zhPmrT47pMoY/K5MpVJhLIIlAkEA73GFZHmfqgUf' +
  'hkRUSmBFvBesgpwnHInNCNC/n+f5KyzOG+DqrP480hMmQBzLfR6mwdfqQR1MbWzi' +
  'pJNEN5UxnwJBANxdbBM61HqbXkYCKIzfHIBJtwdKNe/a9mJOSDfABhuqehcoWDNT' +
  'y+f2BW486xxDWWQMr03XA8rcDozFG+5XpgcCQG4/B5sWgNRInZY1mdXQ8+rBv7U3' +
  'bq6uKBB6BPD8XvZpH9EoQwU53gkftgno+Cx403EHGB24/rqXWtdJ0ywAbqMCQEId' +
  'qYJvgTa0DOn2VdJGUpfPBiIiyuIHEStXj2VisLJ2SKFQEn574s7ayrBTiLr3Hgfd' +
  'om85VsLzmU31CbdOBtsCQQDURnj9SxcbyMLEprc+8xbHpVEuKszEXOwhrJbn7wHh' +
  'YOBzM/YBM4giI7H49KspTv2KNK8Asy3VEiUgF1qvJDdr';

  constructor() { }

  public encrypt(value: string): string {
    let Encrypt = require('jsencrypt');
    let encrypter = new Encrypt.JSEncrypt();
    encrypter.setPublicKey(this.pem);
    return encrypter.encrypt(value);
  }

  public decrypt(value: string): string {
    let Encrypt = require('jsencrypt');
    let encrypter = new Encrypt.JSEncrypt();
    encrypter.setPrivateKey(this.pvem);
    return encrypter.decrypt(value);
  }

}
