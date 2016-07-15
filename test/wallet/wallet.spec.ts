/**
 * Created by shumer on 7/13/16.
 */
import {beforeEachProviders, it, describe, expect, inject, beforeEach} from '@angular/core/testing';
import {Wallet} from '../../app/components/wallet/wallet';

describe('Wallet Service', () => {

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

            expect(wallet.validateAmount(null)).toBeFalsy();

            expect(wallet.validateAmount(config.amountExisted + 200)).toBeFalsy();

            expect(wallet.validateAmount(0)).toBeFalsy();

            expect(wallet.validateAmount(config.amountSent)).toBeTruthy();
        });
    });

    it('Transaction', (done) => {
        Wallet.generate(config.seed, config.salt).then((data) => {
            let wallet: Wallet = new Wallet(data);

            let first = false;
            wallet.sendRawTransaction(config.toAddress, config.amountExisted + 200).then(function(error){
                expect(error).toBeTruthy();
                first = true;
                if(second){
                    done();
                }
            });

            let second = false;
            wallet.sendRawTransaction(config.toAddress, config.amountSent).then(function(error){
                expect(error).toBeFalsy();
                second = true;
                if(first){
                    done();
                }
            });
        });
    });

    it('Mining active', () => {
        expect(Wallet.miningIsActive()).toBeTruthy();
    });

});
