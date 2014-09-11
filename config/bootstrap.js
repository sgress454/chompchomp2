/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  async.auto({
    player1: function(cb) {
      User.findOrCreate({email:'scott@balderdash.co'}, {
        email:'scott@balderdash.co',
        firstName: 'Scott',
        lastName: 'Gress',
        password: 'abc123'
      }).exec(cb);
    },
    player2: function(cb) {
      User.findOrCreate({email:'cody@balderdash.co'}, {
        email:'cody@balderdash.co',
        firstName: 'Cody',
        lastName: 'Stoltman',
        password: 'abc123'
      }).exec(cb);
    },
    player3: function(cb) {
      User.findOrCreate({email:'mike@balderdash.co'}, {
        email:'mike@balderdash.co',
        firstName: 'Mike',
        lastName: 'McNeil',
        password: 'abc123'
      }).exec(cb);
    },
    player4: function(cb) {
      User.findOrCreate({email:'jacqueline.a.hughes@gmail.com'}, {
        email:'jacqueline.a.hughes@gmail.com',
        firstName: 'Jacqueline',
        lastName: 'Hughes',
        password: 'abc123'
      }).exec(cb);
    },
    game: ['player1', 'player2', function(cb, results) {
      Game.findOrCreate({
        player1: results.player1.id,
        player2: results.player2.id
      }, {
        player1: results.player1.id,
        player2: results.player2.id
      }).exec(cb);
    }]
  }, cb);
};
