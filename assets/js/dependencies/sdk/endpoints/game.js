angular.module('chompchomp_api');
angular.module('chompchomp_api').config(["chompchomp_endpointsProvider",

  function(chompchomp_endpoints) {

      angular.extend(chompchomp_endpoints.$get(), {

        /**
         * chompchomp.getGame()
         *
         * GET /game/:id
         *
         * ----------------------------------------------------------------
         * chompchomp.getGame(gameId)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         */

        getGame: function (gameId) {

          var request = {
            url: '/game/'+gameId,
            method: 'GET'
          };

          return request;

        },

        joinGame: function (gameId) {

          var request = {
            url: '/game/'+gameId+'/join',
            method: 'PUT'
          };

          return request;

        },

        findGames: function() {

          var request = {
            url: '/game',
            method: 'GET'
          };

          return request;

        },

        newGame: function(player1) {

          var request = {
            url: '/game',
            method: 'POST',
            params: {
              player1: player1
            }
          };

          return request;

        },

        move: function (gameId, from, to) {

          var request = {
            url: '/game/'+gameId+'/move',
            method: 'POST',
            params: {
              from: from,
              to: to
            }
          };

          return request;

        }

      });


  }

]);

