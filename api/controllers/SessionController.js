/**
 * Module dependencies
 */

var bcrypt = require('bcryptjs');
var hat = require('hat').rack();


/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  login: function (req, res) {

    // Get the email and password out of the request.
    var email = req.param('email');
    var password = req.param('password');

    // If either are blank, return a 403 response.
    if (!email || !password) {
      return res.forbidden();
    }

    // Find the user with the specifed email.
    User.findOne({ email: email }).exec(function (err, user) {
      if(err) {return res.serverError();}

      // For security concerns we don't need to expose that this was an invalid email address.
      // Just return a 403 for both invalid emails and passwords
      if(!user) {return res.forbidden();}

      // Check that the password is correct
      bcrypt.compare(password, user.password, function (err, valid) {

        // Handle errors
        if(err) {return res.serverError();}

        // Handle invalid password
        if(!valid) {return res.forbidden();}

        // Create a JSON representation of the user
        var _user = user.toJSON();

        // Set that representation in the session, effectively logging the user in
        req.session.user = _user;

        // Response with an OK.
        return res.ok();

      });
    });
  },

  /**
   * Log out the current user.
   */
  logout: function (req, res) {

    // Delete the current user record from the session.
    delete req.session.user;

    // Return with an OK.
    return res.ok();
  },

  verify: function (req,res) {
    var token = req.param('resetPasswordToken');

    if (!token) {return res.send(401);}

    User.find({resetPasswordToken:token}).exec(function(err,users){
      if (err) {return res.badRequest();}

      // Ensures tokens are unique
      if (users.length === 1) {
        var gotUser = users.pop();

        // Ensures a logged in user cant use a token
        if (req.session.user) {return res.badRequest();}

        req.session.user = gotUser.toJSON();
        User.update(req.session.user.id,{resetPasswordToken:null}).exec(function(err,updatedRecord){

          if (err) {return res.serverError();}

          return res.ok();

        });

      } else {
        return res.badRequest();
      }

    });
  }

};
