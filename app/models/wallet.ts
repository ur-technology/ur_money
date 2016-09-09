import * as log from 'loglevel';

export class WalletModel {

  private static ScryptWorkFactor_N: number = 75;
  private static ScryptBlocksize_r: number = 16;
  private static ScryptParallelization_p: number = 1;
  private static ScryptOutputSize: number = 64;
  private static BrainWalletRepetitions = 16384;
  private static GasLimit = 50000;
  private static _web3: any;
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

  public static web3() {
    if (!this._web3) {
      let Web3 = require('web3');
      this._web3 = new Web3(new Web3.providers.HttpProvider("http://138.68.52.104:9595"));
    }
    return this._web3;
  }

  public static availableBalance(address) {
    let balanceInWei = this.web3().eth.getBalance(address);
    let balance = this.web3().fromWei(parseFloat(balanceInWei));
    let gasPrice = this.web3().fromWei(this.web3().eth.gasPrice);
    return Math.max(balance - gasPrice * this.GasLimit, 0);
  }

  public static availableBalanceAsync(address): Promise<any> {
    return new Promise((resolve, reject) => {
      this.web3().eth.getBalance(address, (error, balanceInWei) => {
        if (error) {
          log.error(error);
          reject(error);
        } else {
          let balance = this.web3().fromWei(parseFloat(balanceInWei));
          this.web3().fromWei(this.web3().eth.getGasPrice((error, result) => {
            let gasPrice = this.web3().fromWei(result);
            let availableBalance = Math.max(balance - gasPrice * this.GasLimit, 0);
            resolve(availableBalance);
          }));
        }
      });
    });
  }

  public static validateAmount(address: string, amount: number) {
    return amount > 0 && amount <= this.availableBalance(address);
  }

  public static miningIsActive() {
    let mining = this.web3().eth.mining;
    return mining;
  }

  constructor(wallet) {
    this._wallet = wallet;
  };

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
    return new Promise<boolean>((resolve, reject) => {
      let ethUtil = require('ethereumjs-util');
      let ethTx = require('ethereumjs-tx');
      let from = self.getAddress();
      let web3 = WalletModel.web3();
      let eth = web3.eth;

      let rawTx: any = {
        nonce: eth.getTransactionCount(from),
        to: to,
        from: from,
        value: web3.toWei(amount),
        gasPrice: eth.gasPrice,
        gasLimit: eth.getBlock(eth.blockNumber).gasLimit
      };
      rawTx.gas = eth.estimateGas(rawTx)
      let tx = new ethTx(rawTx);
      let privateKey = self.getPrivate(false);
      tx.sign(privateKey);
      let serializedTx = tx.serialize();

      eth.sendRawTransaction(serializedTx.toString('hex'), (error: any, hash: string) => {
        if (error) {
          log.error(error);
          reject(error);
        } else {
          rawTx.hash = hash;
          log.debug("sent raw transaction, hash= " + hash);
          resolve(rawTx);
        }
      })
    });
  }

  public sendTransaction(to: string, amount: number): Promise<any> {
    let self = this;
    return new Promise<boolean>((resolve, reject) => {
      let ethUtil = require('ethereumjs-util');
      let web3 = WalletModel.web3();
      web3.eth.sendTransaction({
        from: self.getPrivate(true),
        to: (ethUtil.isHexPrefixed(to) ? to.toString() : ('0x' + to).toString()),
        value: parseInt(web3.toWei(amount))
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
