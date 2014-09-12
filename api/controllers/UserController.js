/**
 * Module dependencies
 */

var bcrypt = require('bcryptjs');
var hat = require('hat').rack();


/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  signup: function(req, res) {

    var data = req.params.all();
    User.create(data).exec(function(err, user) {
      if (err) {return res.negotiate(err);}
      req.session.user = user.toJSON();
      if (!req.wantsJSON) {
        return res.redirect("/dashboard");
      } else {
        return res.ok(user);
      }
    });

  },

  /**
   * Update the logged-in user
   *
   * This action is protected by a policy preventing access if no user is logged in.
   */
  update: function(req, res) {

    // Get all params out of the request
    var updateValues = req.params.all();

    // User `updateUser` model class method to perform the update
    User.update({id: req.session.user.id}, updateValues, function(err, updatedUser) {

      // Handle error
      if (err) {
        return res.negotiate(err);
      }

      // Return JSON representation of updated user
      return res.json(updatedUser[0]);

    });

  },

  /**
   * Retrieve profile info for the logged-in user
   *
   * This action is protected by a policy preventing access if no user is logged in.
   *
   */
  findOne: function (req, res) {

    // Find the user record for the logged-in user
    User.findOne(req.session.user.id, function(err, user) {

      // Handle errors
      if (err) {return res.serverError(err);}

      // This should never happen
      if (!user) {return res.serverError("No record found for logged-in user!");}

      // Return JSON representation of user record
      return res.json(user);

    });

  },

  /**
   * Create a new resetPasswordToken for a user and send them an email
   *
   */
  requestPasswordReset: function (req, res) {

    // Email is a required parameter.
    if (!req.param('email')) {
      return res.badRequest("Request must contain an email address.");
    }

    // Find the user with the specified email.
    User.findOne({email: req.param('email')}).exec(function(err, user) {
      if (err) {return res.serverError(err);}

      // If no such user exists, return a 404
      if (!user) {return res.notFound();}

      // Create a new password reset token
      var token = hat();

      // Update the user with the new token
      User.update({id: user.id}, {resetPasswordToken: token}).exec(function(err) {
        if (err) {return res.serverError(err);}

        // Send an email to the user with a password reset link
        sails.hooks.email.send(
          'requestPasswordReset',
          {
            user: user,
            token: token,
            appName: sails.config.application.APP_NAME_VERBOSE,
            appURL: sails.config.application.APP_URL_VERBOSE
          },
          {
            to: user.email,
            from: 'noreply@nomnomnomnomnom.me',
            subject: 'Reset password for ' + sails.config.application.APP_NAME_VERBOSE
          },
          function(err) {

            // Handle errors
            if (err) {return res.serverError(err);}

            // Respond to the client with an OK.
            return res.ok();
          }
        );
      });
    });
  },

  /**
   * Reset a user's password
   *
   * This action is protected by a policy preventing access if no user is logged in.
   */
  resetPassword: function(req, res) {

    // Ignore everything in the request besides 'password'
    var updateValues = _.pick(req.params.all(), ['password']);

    // User `updateUser` model class method to perform the update
    User.update({id: req.session.user.id}, updateValues, function(err, updatedUser) {

      // Handle error
      if (err) {
        return res.negotiate(err);
      }

      // Respond with an OK.
      return res.ok();

    });

  }

};

