import * as log from 'loglevel';
import {Config} from '../config/config';
// import {BigNumber} from 'bignumber.js';

export class WalletModel {

  private static ScryptBlocksize_r: number = 16;
  private static ScryptParallelization_p: number = 1;
  private static ScryptOutputSize: number = 64;
  private static BrainWalletRepetitions = 16384;
  private static _web3: any;
  private _wallet: any;

  public static validateCredentials(seed: string, salt: string) {
    return (typeof seed !== 'undefined' && seed !== '' && typeof salt !== 'undefined' && salt !== '');
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
      });
    });
  };

  public static web3() {
    if (!this._web3) {
      let Web3 = require('web3');
      this._web3 = new Web3(new Web3.providers.HttpProvider(Config.transactionRelay));
    }
    return this._web3;
  }

  // public static estimatedFeeWei(): any {
  //   let gas = new BigNumber(21000);
  //   let gasPrice = this.web3().eth.gasPrice;
  //   let calculatedFee = gas.times(gasPrice);
  //   let minimumFee = this.web3().toWei(0.095);
  //   return BigNumber.max(calculatedFee, minimumFee);
  // }
  //
  // private static calculateBalanceInfo(balanceWei, rounding?: boolean, pendingAmountWei?: any): any {
  //   let currentBalance = new BigNumber(balanceWei).dividedBy('1000000000000000000');
  //   let availableBalance = BigNumber.max(balanceWei.plus(pendingAmountWei || 0), 0).dividedBy('1000000000000000000');
  //   let estimatedFee = this.estimatedFeeWei().dividedBy('1000000000000000000');
  //
  //   if (rounding) {
  //     currentBalance = currentBalance.round(0, BigNumber.ROUND_HALF_FLOOR);
  //     availableBalance = availableBalance.round(0, BigNumber.ROUND_HALF_FLOOR);
  //     estimatedFee = estimatedFee.round(5, BigNumber.ROUND_UP);
  //   }
  //
  //   return {
  //     currentBalance: currentBalance,
  //     availableBalance: availableBalance,
  //     estimatedFee: estimatedFee
  //   };
  // }
  //
  // public static availableBalance(address, rounding?: boolean, pendingAmountWei?: any): any {
  //   let balanceWei = this.web3().eth.getBalance(address);
  //   return this.calculateBalanceInfo(balanceWei, rounding, pendingAmountWei);
  // }
  //
  // public static availableBalanceAsync(address: string, rounding?: boolean, pendingAmountWei?: any): Promise<any> {
  //   let self = this;
  //   return new Promise((resolve, reject) => {
  //     self.web3().eth.getBalance(address, (error, balanceWei) => {
  //       if (error) {
  //         log.error(error);
  //         reject(error);
  //       } else {
  //         resolve(self.calculateBalanceInfo(balanceWei, rounding, pendingAmountWei));
  //       }
  //     });
  //   });
  // }
  //
  // public static validateAmount(address: string, amount: number) {
  //   return amount > 0 && amount <= this.availableBalance(address);
  // }
  //
  public static miningIsActive() {
    let mining = this.web3().eth.mining;
    return mining;
  }

  constructor(wallet) {
    this._wallet = wallet;
  };

  public validateAddress(address: string) {
    let self = this;

    if (typeof address === 'undefined' || address === '') {
      return false;
    }

    let ethUtil = require('ethereumjs-util');

    if (!ethUtil.isHexPrefixed(address)) {
      address = ('0x' + address);
    }

    return ((ethUtil.isValidPublic(address) && address !== self.getPublic()) || (ethUtil.isValidAddress(address) && address !== self.getAddress()));
  }

  public static validateAddressFormat(address: string): boolean {

    if (typeof address === 'undefined' || address === '') {
      return false;
    }

    let ethUtil = require('ethereumjs-util');

    if (!ethUtil.isHexPrefixed(address)) {
      address = ('0x' + address);
    }
    return ethUtil.isValidAddress(address);
  }

  public static prefixAddress(address) {
    let ethUtil = require('ethereumjs-util');

    if (!ethUtil.isHexPrefixed(address)) {
      address = ('0x' + address);
    }

    return address;
  }

  public sendRawTransaction(to: string, amount: number): Promise<any> {
    let self = this;
    return new Promise<boolean>((resolve, reject) => {
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
      rawTx.gas = eth.estimateGas(rawTx);
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
          log.debug('sent raw transaction, hash= ' + hash);
          resolve(rawTx);
        }
      });
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
      });
    });
  }

  public getPrivate(stringVar: boolean) {
    if (stringVar) {
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
