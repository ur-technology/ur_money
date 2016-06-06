// migrate data
 if (this.migrate) {
   var usersRef = Auth.firebaseRef().child("users");
   usersRef.once("value", function(snapshot) {
     var allUsers = snapshot.val();
     _.each(allUsers, function(user: any, uid: string) {

       // replace the following 5 lines to do your data migration
       var condition = false;
       if (condition) {
         var newData: any = {};
         usersRef.child(uid).update(newData);
       };

     });
   });

 }
