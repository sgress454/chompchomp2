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

