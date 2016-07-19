import {FirebaseModel} from './firebase-model';

export class ChatMetaItem extends FirebaseModel {
  createdAt: number;
  invitedAt: number;

  static findOrCreateByUsers(user1: User, user2: User) {
    return new Promise((resolve) => {
      ChatMetaItem.all(`/users/${user1.key}/chatMetaItems`).then((chatMetaItems) => {
        let chatId = _.findIndex(chatMetaItems, function(chatMetaItem, chatId) {
            return !!chatMetaItem.users[user.key];
          });
        }
        if (chatId) {
          ChatContentItem.find(`/users/${user1.key}/chatContentItems`, chatId).then((chatContentItem) => {
            resolve(chatContentItem);
          });
        } else {
          let chat = new Chat('/users', { createdAt: xxx });
          chat.addUser(user1);
          chat.addUser(user2);
          chat.save().then((_) => {
            resolve(chat);
          })
        }
      });
    });
  }

  save() {
    super();
    // add copy of new chatMetaItem and chatContentItem
  }
}
