/**
 * Module dependencies
 */

var bcrypt = require('bcryptjs');


/**
* User.js
*
* @description :: Represents an end user of the app.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    email: {
      type: "string",
      required: true,
      unique: true
    },

    password: {
      type: "string",
      required: true,
      minLength: 6
    },

    resetPasswordToken: {
      type: "string"
    },

    username: {
      type: "string",
      unique: true
    },

    firstName: {
      type: "string",
      required: true

    },

    lastName: {
      type: "string",
      required: true

    },

    // Filter the object we get when sending a JSON response
    toJSON: function() {

      var obj = this.toObject();
      // Remove the password and reset password token
      delete obj.password;
      delete obj.resetPasswordToken;
      // Return the rest
      return obj;

    }

  },

  /**
   * beforeCreate lifecycle callback
   */
  beforeCreate: function(vals,done){
    // Always hash the password before continuing
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(vals.password, salt, function(err, hash) {
          if (err) return err;

          vals.password = hash;
          return done();
        });
    });
  },

  /**
   * beforeUpdate lifecycle callback
   */
  beforeUpdate: function(vals,done){
    // If a password is passed in, hash it before continuing
    if (vals.password) {
      bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(vals.password, salt, function(err, hash) {
            if (err) return err;

            vals.password = hash;
            return done();
          });
      });
    } else {
      return done();
    }
  }

};

