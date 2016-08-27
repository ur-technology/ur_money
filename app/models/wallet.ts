import * as log from 'loglevel';

export class WalletModel {

  private static ScryptWorkFactor_N: number = 75;
  private static ScryptBlocksize_r: number = 16;
  private static ScryptParallelization_p: number = 1;
  private static ScryptOutputSize: number = 64;
  private static BrainWalletRepetitions = 16384;
  private static GasLimit = 50000;
  private static _connection: any;

  private _wallet: any;

  public static validateCredentials(seed: string, salt: string) {
    return (typeof seed != 'undefined' && seed != '' && typeof salt != 'undefined' && salt != '');
  }

  public static generate(seed: string, salt: string) {
    let scryptAsync = require('scrypt-async');
    let ethWallet = require('ethereumjs-wallet');
    let ethUtil = require('ethereumjs-util');

    return new Promise((resolve, reject) => {
      scryptAsync(seed, salt, this.ScryptParallelization_p, this.ScryptBlocksize_r, this.ScryptOutputSize, (seed) => {
        let hashedSeed = ethUtil.sha3(seed);
        for (var i = 1; i <= this.BrainWalletRepetitions; i++) {
          hashedSeed = ethUtil.sha3(hashedSeed);
        }
        resolve(ethWallet.fromPrivateKey(hashedSeed));
      })
    });
  };

  public static availableBalance(address) {
    let balanceInWei = this.connection().eth.getBalance(address);
    let balance = this.connection().fromWei(parseFloat(balanceInWei));
    let gasPrice = this.connection().fromWei(this.connection().eth.gasPrice);
    return Math.max(balance - gasPrice * this.GasLimit, 0);
  }

  public static validateAmount(address: string, amount: number) {
    return amount > 0 && amount <= this.availableBalance(address);
  }

  public static miningIsActive() {
    let mining = this.connection().eth.mining;
    return mining;
  }

  constructor(wallet) {
    this._wallet = wallet;
  };

  public static connection() {
    if (!this._connection) {
      let web3 = require('web3');
      this._connection = new web3(new web3.providers.HttpProvider("http://45.55.7.79:9595"));
    }
    return this._connection;
  }

  public connection() {
    return WalletModel.connection();
  }

  public validateAddress(address: string) {
    let self = this;

    if (typeof address == 'undefined' || address == '') {
      return false;
    }

    let ethUtil = require('ethereumjs-util');

    if (!ethUtil.isHexPrefixed(address)) {
      address = ('0x' + address);
    }

    return ((ethUtil.isValidPublic(address) && address != self.getPublic()) || (ethUtil.isValidAddress(address) && address != self.getAddress()));
  }

  public sendRawTransaction(to: string, amount: number): Promise<any> {
    let self = this;
    let ethUtil = require('ethereumjs-util');
    let ethTx = require('ethereumjs-tx');
    let eth = self.connection().eth;
    let toHex = self.connection().toHex;

    let rawTx: any = {
      nonce: toHex(Date.now()),
      gasPrice: toHex(eth.gasPrice),
      gasLimit: toHex(29000),
      to: to,
      from: self.getAddress(),
      value: self.connection().toWei(amount)
    };
    rawTx.gas = eth.estimateGas(rawTx);

    let tx = new ethTx(rawTx);
    tx.sign(self.getPrivate(false));
    let serializedTx = tx.serialize().toString('hex');

    return new Promise<boolean>((resolve, reject) => {
      eth.sendRawTransaction(serializedTx, (error: any, hash: string) => {
        if (error) {
          log.error(error);
          reject(error);
        } else {
          rawTx.hash = hash;
          resolve(rawTx);
        }
      })
    });
  }

  public sendTransaction(to: string, amount: number): Promise<any> {
    let self = this;
    let ethUtil = require('ethereumjs-util');

    return new Promise<boolean>((resolve, reject) => {
      self.connection().eth.sendTransaction({
        from: self.getPrivate(true),
        to: (ethUtil.isHexPrefixed(to) ? to.toString() : ('0x' + to).toString()),
        value: parseInt(self.connection().toWei(amount))
      }, (error, address) => {
        if (error) {
          log.error(error);
          reject(error);
        } else {
          resolve();
        }
      })
    });
  }

  private getWallet() {
    return this._wallet;
  };

  public getPrivate(string: boolean) {
    if (string) {
      return this._wallet.getPrivateKeyString();
    } else {
      return this._wallet.getPrivateKey();
    }
  };

  public getAddress() {
    return this._wallet.getAddressString();
  };

  public getPublic() {
    return this._wallet.getPublicKeyString();
  };
}
