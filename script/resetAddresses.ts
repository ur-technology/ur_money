import {WalletModel} from '../app/models/wallet';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';

_.each([
  '-KJn47TvHAlfQocDX_ES',
  '-KJnRTuL8A1ZdfVvwAbv',
  '-KLqYxC3-j6MhstbXiED',
  '-KLwWedxw2DHDhTdTK9-',
  '-KNEKfk_nwPeckdg79HU'
], (userId) => {
  WalletModel.generate("apple apple apple apple apple", userId).then((walletData) => {
    let wallet: WalletModel = new WalletModel(walletData);
    firebase.database().ref(`/users/${userId}/wallet/address`).set(wallet.getAddress());
    console.log(`set address of user ${userId} to ${wallet.getAddress()}`);
  });
});
