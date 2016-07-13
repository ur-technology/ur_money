// // migrate data
//  if (this.migrate) {
//    var usersRef = this.auth.firebaseRef().child("users");
//    usersRef.once("value", function(snapshot) {
//      var allUsers = snapshot.val();
//      _.each(allUsers, function(user: any, userId: string) {
//
//        // replace the following 5 lines to do your data migration
//        var condition = false;
//        if (condition) {
//          var newData: any = {};
//          usersRef.child(userId).update(newData);
//        };
//
//      });
//    });
//
//  }
