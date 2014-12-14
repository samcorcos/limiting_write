var Items = new Mongo.Collection("items");

// Since we aren't using insecure, we need to use "allow" and "deny" methods to determine what is allowed and what is denied. There are 3 CRUD operations we need to specify
// 1. insert
// 2. update
// 3. remove
// Of course, typically, the fourth CRUD operation is find, but that is handled by publish and subscribe, not by the allow and deny methods.

Items.allow({ // The way this works is that if something returns true from the function, then it's allowed. If false, then it's denied.
  insert: function(userid, doc) { // This is the currently logged in user, and the document that the user is trying to insert.
    return (userid && doc.owner === userid); // this is a multi-part expression. The first part is "if there is a user ID, meaning, someone is logged in", and "if the document owner is equal to the currently logged in user" then "you hvae permission to insert"
    // These rules are not set in stone. There are ways to set a propert to "creator" instead of "owner", and even set a property of "guest" in case you dont want to require login.
    // return doc.creator === userid || doc.creator === "guest";
  },
  update: function(userId, docs, fields, modifier) {
    // docs is the entire doc (object) that is being modified
    // fields are the fields being modified. So, for example, if we're changing the "name" field of someone, it would show ['name']
    // the modifier is the mongo command that was passed in, for example: { '$set': { price: '$10.00'} }
    // We want to allow a user to update all of the documents that they own. We can use the underscore method _.all, which will only return true if everything is true.
    return _.all(docs, function(doc) {
      return doc.owner === userId;
    })
  },
  remove: function(userId, docs) {
    return _.all(docs, function(doc) {
      return doc.owner === userId; // This will only allow for the removal of the selected documents if the owner is the currently logged in user.
    })
  }
});

// One super important aspect to all of this is that we need to make sure that we deny the ability of anyone to change the "owner" property!!!

Items.deny({
  insert: function(userId, doc) {

  },
  update: function(userId, docs, fields, modifier) {
    return (fields.indexOf("owner") > -1) // This will check to see if there is an owner property. And, if it's true (meaning, there is an owner property), then it will deny the operation. It's the opposite of the allow method. Meteor always checks the deny methods first, before checking the allow methods.
  },
  remove: function(userId, docs) {

  }
});
