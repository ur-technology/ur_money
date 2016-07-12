export class Wallet {

    private ScryptWorkFactor_N: number = 75;
    private ScryptBlocksize_r: number = 16;
    private ScryptParallelization_p: number = 1;
    private ScryptOutputSize: number = 64;
    private BrainWalletRepetitions = 16384;

    private _wallet:any;

    constructor(){};

    public create(phrase : string, password : string){
        let scryptAsync = require('scrypt-async');
        let ethWallet = require('ethereumjs-wallet');
        let ethUtil = require('ethereumjs-util');

        return new Promise(resolve => {
            scryptAsync(phrase, password, this.ScryptParallelization_p, this.ScryptBlocksize_r, this.ScryptOutputSize, (seed) => {
                let hashedSeed = ethUtil.sha3(seed);

                for (var i = 1; i <= this.BrainWalletRepetitions; i++) {
                    hashedSeed = ethUtil.sha3(hashedSeed);
                }

                this._wallet = ethWallet.fromPrivateKey(hashedSeed);
                resolve();
            })
        });
    };

    public sendTransaction(to: string, amount: number){
        let ethUtil = require('ethereumjs-util');
        let ethTx = require('ethereumjs-tx');
        let web3 = require('web3');
        let web3connection = new web3(new web3.providers.HttpProvider("http://localhost:12345"));

        var rawTx = {
            nonce: web3connection.toHex(web3connection.eth.getTransactionCount(this.getAddress())),
            gasPrice: web3connection.toHex(web3connection.eth.gasPrice),
            gasLimit: web3connection.toHex(300000),
            to: (ethUtil.isHexPrefixed(to) ? ethUtil.toBuffer(to) : ethUtil.toBuffer('0x' + to)),
            from : this.getAddress(),
            value: ethUtil.toBuffer(parseInt(web3connection.toWei(amount))),
        };

        let tx = new ethTx(rawTx);

        tx.sign(this.getPrivate(false));

        let serializedTx = tx.serialize().toString('hex');

        return new Promise((promise) => web3connection.eth.sendRawTransaction(serializedTx,(err) => {
            promise(err)
        }));
    }

    public sendTransaction2(to: string, amount: number){
        let self = this;
        let ethUtil = require('ethereumjs-util');
        let web3 = require('web3');
        let web3connection = new web3(new web3.providers.HttpProvider("http://localhost:12345"));

        return new Promise((resolve) => {
            web3connection.eth.sendTransaction({
                from  : self.getPrivate(true),
                to    : (ethUtil.isHexPrefixed(to) ? to.toString() : ('0x' + to).toString()),
                value : web3connection.toWei(amount)
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
