
before(function(done){
	require('sails').lift({
		hooks: {
			grunt: false
		},
		log: {
			level: 'error'
		},
    routes: {
      // Shortcut route to log user in without using the actual "/me/login" endpoint,
      // which has its own test suite.
      'GET /_login': function(req, res) {
        User.findOne(req.param('id')).exec(function(err, user) {
          if(err) return res.serverError();
          if(!user) return res.notFound();

          var _user = user.toJSON();
          req.session.user = _user;
          res.ok();

        });
      }
    }
	},done);
});
