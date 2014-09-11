var assert = require('assert');
var request = require('request');

describe('UserController.create',function(){

	describe('with valid user input',function(){
		var responseResults;
		var responseBody;
		var newUserId;
		var userValues = {
			"firstName":"nicholas",
			"lastName":"cramrod",
			"email":"nick@blahderdash.co",
      username: "create.user",
			"password":"abc123"
		};

		before(function(done){
			var opt = {
				"url":"http://localhost:1440/me/signup",
				"method":"POST",
				"json": userValues
			};

			request(opt,function(err,res,body){
				responseResults = res;
				responseBody = body;
				newUserId = responseBody.id;
				return done(err);
			});
		});

		it('should return a 200 response',function(){
			assert(responseResults.statusCode === 200, 'Wanted status code 200, received '+responseResults.statusCode);
		});

		describe('should create a new user',function(){
			var newUser;

			it('and it can be retrieved with user.findOne()',function(done){
				User.findOne(newUserId).exec(function(err,user){
					newUser=user;
					assert(user, 'Wanted a user.  Got nothing.');
					return done();
				});
			});

			it('which contains a value for all required fields',function(done){
				// Iterate through required fields, checking that they exist and arent undefined.
				var badFields = _.filter(Object.keys(userValues),function(oneField){
					return !_.isUndefined(newUser[oneField]);
				});
				assert(badFields.length>0,'expected zero undefined fields.  Instead, we have',badFields.length+':'+badFields);
				return done();
			});

			it('and the object has a hashed password',function(done){
				assert((newUser.password && newUser.password !== userValues.password),'Wanted a hashed password different from '+userValues.password+'.  Instead got '+newUser.password);
				return done();
			});

			it('and other users can\'t be created with this email',function(done){
        var userValues2 = _.cloneDeep(userValues);
        userValues2.username = "user2";
				var opt = {
					"url":"http://localhost:1440/me/signup",
					"method":"POST",
					"json": userValues
				};

				request(opt,function(err,res,body){
					assert(res.statusCode===400,'wanted a 400 error. Instead got '+res.statusCode);
					return done();
				});
			});

      it('and other users can\'t be created with this username',function(done){
        var userValues2 = _.cloneDeep(userValues);
        userValues2.email = "uniq@example.com";
        var opt = {
          "url":"http://localhost:1440/me/signup",
          "method":"POST",
          "json": userValues2
        };

        request(opt,function(err,res,body){
          assert(res.statusCode===400,'wanted a 400 error. Instead got '+res.statusCode);
          return done();
        });
      });

		});

	});

	describe('with invalid user input',function(){
		var goodUserValues = {
			"firstName":"nicholas",
			"lastName":"cramrod",
			"email":"ricardo@blahderdash.co",
      username: "create.user2",
			"password":"abc123"
		};

		it('leaving "firstName" empty should return a 400 response',function(done){
			var badRecord = _.cloneDeep(goodUserValues);
			badRecord.firstName = "";
			var opt = {
				"url":"http://localhost:1440/me/signup",
				"method":"POST",
				"json": badRecord
			};
			request(opt,function(err,res,body){
				responseResults = res;
				assert(res.statusCode===400,'We wanted a 400 error.  Instead we got:'+res.statusCode);
				return done();
			});
		});
		it('leaving "lastName" empty should return a 400 response',function(done){
			var badRecord = _.cloneDeep(goodUserValues);
			badRecord.lastName = "";
			var opt = {
				"url":"http://localhost:1440/me/signup",
				"method":"POST",
				"json": badRecord
			};
			request(opt,function(err,res,body){
				responseResults = res;
				assert(res.statusCode===400,'We wanted a 400 error.  Instead we got:'+res.statusCode);
				return done();
			});
		});
		it('leaving "email" empty should return a 400 response',function(done){
			var badRecord = _.cloneDeep(goodUserValues);
			badRecord.email = "";
			var opt = {
				"url":"http://localhost:1440/me/signup",
				"method":"POST",
				"json": badRecord
			};
			request(opt,function(err,res,body){
				responseResults = res;
				assert(res.statusCode===400,'We wanted a 400 error.  Instead we got:'+res.statusCode);
				return done();
			});
		});
		it('leaving "password" empty should return a 400 response',function(done){
			var badRecord = _.cloneDeep(goodUserValues);
			badRecord.password = "";
			var opt = {
				"url":"http://localhost:1440/me/signup",
				"method":"POST",
				"json": badRecord
			};
			request(opt,function(err,res,body){
				responseResults = res;
				assert(res.statusCode===400,'We wanted a 400 error.  Instead we got:'+res.statusCode);
				return done();
			});
		});

		it('the password should be longer at least 6 characters long',function(done){
			var badRecord = _.cloneDeep(goodUserValues);
			badRecord.password = "xyz1";
			var opt = {
				"url":"http://localhost:1440/me/signup",
				"method":"POST",
				"json": badRecord
			};
			request(opt,function(err,res,body){
				assert(res.statusCode===400,'We wanted a 400 error.  Instead we got:'+res.statusCode);
				return done();
			});
		});


	});

});
