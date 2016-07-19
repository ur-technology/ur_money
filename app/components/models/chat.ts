import {FirebaseModel} from './firebase-model';

// security rules

// /users/5/profile/firstName...
// /users/5/chats/7/messages/12/text: "Hello"
// /users/5/chats/7/messages/12/original: true
// /users/5/chats/7/messages/12/users/5/...
// /users/5/chats/7/messages/12/users/6/...
// /users/5/chatSummaries/7: contains lastMessage plus selected fields from /users/5/chats/7/

// privileged process:
//  every time a record is added to any users chat message:
//    copy the message to other participants chat messages (but without original: true)

export class ChatSummary extends FirebaseModel {
}

export class Chat extends FirebaseModel {
  createdAt: number;
  invitedAt: number;

  static findOrCreateByUsers(user1: User, user2: User) {
    return new Promise((resolve) => {
      ChatSummary.all(`/users/${user1.key}/chatSummaries`).then((chatSummaries) => {
        let chatId = _.findIndex(chatSummaries, function(chatSummary, chatId) {
            return !!chatSummary.users[user.key];
          });
        }
        if (chatId) {
          Chat.find(`/users/${user1.key}/chats`, chatId).then((chat) => {
            resolve(chat);
          });
        } else {
          let chat = new Chat(`/users/${user1.key}/chats`, { createdAt: xxx });
          chat.addUser(user1); // need to define
          chat.addUser(user2); // need to define
          chat.save().then((_) => {
            resolve(chat);
          })
        }
      });
    });
  }

  save() {
    super();
    // set lastMessage in associated chatSummary
  }
}
