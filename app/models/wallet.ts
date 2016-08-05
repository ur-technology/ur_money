import * as log from 'loglevel';

export class WalletModel {

    private static ScryptWorkFactor_N: number = 75;
    private static ScryptBlocksize_r: number = 16;
    private static ScryptParallelization_p: number = 1;
    private static ScryptOutputSize: number = 64;
    private static BrainWalletRepetitions = 16384;

    private _wallet:any;
    private _connection:any;

    public static validateCredentials(seed : string, salt : string){
        return (typeof seed != 'undefined' && seed != '' && typeof salt != 'undefined' && salt != '');
    }

    public static generate(seed : string, salt : string){
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

    constructor(wallet){
        let web3 = require('web3');
        this._connection = new web3(new web3.providers.HttpProvider("http://localhost:12345"));

        this._wallet = wallet;
    };

    public static miningIsActive(){
        let web3 = require('web3');
        let connection = new web3(new web3.providers.HttpProvider("http://localhost:12345"));

        let mining = connection.eth.mining;
        return mining;
    }

    public validateAddress(address: string){
        let self = this;

        if(typeof address == 'undefined' || address == ''){
            return false;
        }

        let ethUtil = require('ethereumjs-util');

        if(!ethUtil.isHexPrefixed(address)){
            address = ('0x' + address);
        }

        return ((ethUtil.isValidPublic(address) && address != self.getPublic()) || (ethUtil.isValidAddress(address) && address != self.getAddress()));
    }

    public validateAmount(amount: number){
        let self = this;

        var balance = self._connection.eth.getBalance(self.getAddress());

        return (amount > 0 && self._connection.fromWei(parseFloat(balance)) > amount);
    }

    public sendRawTransaction(to: string, amount: number) : Promise<boolean> {
        let self = this;
        let ethUtil = require('ethereumjs-util');
        let ethTx = require('ethereumjs-tx');

        var rawTx = {
            nonce: self._connection.toHex(Date.now()),
            gasPrice: self._connection.toHex(self._connection.eth.gasPrice),
            gasLimit: self._connection.toHex(300000),
            to: (ethUtil.isHexPrefixed(to) ? ethUtil.toBuffer(to) : ethUtil.toBuffer('0x' + to)),
            from : this.getAddress(),
            value: ethUtil.toBuffer(parseInt(self._connection.toWei(amount))),
        };

        let tx = new ethTx(rawTx);

        tx.sign(this.getPrivate(false));

        let serializedTx = tx.serialize().toString('hex');

        return new Promise<boolean>((resolve, reject) => {
            self._connection.eth.sendRawTransaction(serializedTx, (error:any) => {
                log.error(error);
                resolve(!!error);
            })
        });
    }

    public sendTransaction(to: string, amount: number) : Promise<boolean>{
        let self = this;
        let ethUtil = require('ethereumjs-util');
        let web3 = require('web3');

        return new Promise<boolean>((resolve, reject) => {
            self._connection.eth.sendTransaction({
                from  : self.getPrivate(true),
                to    : (ethUtil.isHexPrefixed(to) ? to.toString() : ('0x' + to).toString()),
                value : parseInt(self._connection.toWei(amount))
            }, (err, address) => {
                resolve(err);
            })
        });
    }

    private getWallet(){
        return this._wallet;
    };

    public getPrivate(string:boolean){
        if(string){
            return this._wallet.getPrivateKeyString();
        } else {
            return this._wallet.getPrivateKey();
        }
    };

    public getAddress(){
        return this._wallet.getAddressString();
    };

    public getPublic(){
        return this._wallet.getPublicKeyString();
    };
}
