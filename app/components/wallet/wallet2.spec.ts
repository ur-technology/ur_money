/**
 * Created by shumer on 7/13/16.
 */
import {beforeEachProviders, it, describe, expect, inject, beforeEach} from '@angular/core/testing';
import {Wallet} from './wallet2';

describe('Wallet Service', (require, exports, module) => {

    var config = {
        seed : '12345',
        salt : '12345',
        amountExisted : 5,
        amountSent : 2,
        fromAddress : '4f04ffdb083e399bede0b689b229b5e9234a919c',
        toAddress : 'b3244b260355d9ef74fb6520c00b7359f5e967e3'
    };

    beforeEachProviders(() => [Wallet]);

    it('Validating credentials', () => {
        // if(Wallet.validateCredentials(self.phrase, self.password)){
        //     Wallet.generate(self.phrase, self.password).then((data) => {
        //         let wallet: Wallet = new Wallet(data);
        //
        //         if(!wallet.validateAddress(self.publicKey)){
        //             self.error("Recipient address is not valid");
        //             return;
        //         }
        //
        //         if(!wallet.validateAmount(self.amount)){
        //             self.error("Not enough coins or amount is not correct");
        //             return;
        //         }
        //
        //         wallet.sendRawTransaction(self.publicKey, self.amount).then((err) => {
        //             if (!err)
        //                 self.success();
        //             else
        //                 self.error("An error occured during transaction");
        //         });
        //     })
        // } else {
        //     self.error("Enter secret phrase and password");
        // }

        expect(Wallet.validateCredentials('', config.salt)).toBeFalsy();

        expect(Wallet.validateCredentials(config.seed, '')).toBeFalsy();

        expect(Wallet.validateCredentials(config.seed, config.salt)).toBeTruthy();


    });

    it('Creating wallet', () => {
        Wallet.generate(config.seed, config.salt).then((data) => {
            let wallet: Wallet = new Wallet(data);

            expect(typeof wallet).toBe('object');

            expect(wallet.getAddress()).toEqual('0x' + config.fromAddress);
        });
    });

    it('Validating address', () => {
        Wallet.generate(config.seed, config.salt).then((data) => {
            let wallet: Wallet = new Wallet(data);

            expect(wallet.validateAddress('')).toBeFalsy();

            expect(wallet.validateAddress('0x' + config.fromAddress)).toBeFalsy();

            expect(wallet.validateAddress(config.fromAddress)).toBeFalsy();

            expect(wallet.validateAddress('0x' + config.toAddress)).toBeTruthy();

            expect(wallet.validateAddress(config.toAddress)).toBeTruthy();
        });
    });

    it('Validating amount', () => {
        Wallet.generate(config.seed, config.salt).then((data) => {
            let wallet: Wallet = new Wallet(data);

            // expect(wallet.validateAmount(null)).toBeFalsy();

            // expect(wallet.validateAmount(config.amountExisted + 20)).toBeFalsy();
            //
            // expect(wallet.validateAmount(0)).toBeFalsy();
            //
            // expect(wallet.validateAmount(config.amountSent)).toBeTruthy();
        });
    });

});
