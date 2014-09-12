angular.module('chompchomp').controller('DashboardCtrl', [

  '$rootScope',
  '$scope',
  '$element',
  'api',

  function($rootScope, $scope, $element, $api) {

    $api.findGames()
    .then(function(data) {
      $scope.gamesInProgress = data.gamesInProgress;
      $scope.gamesJoinable = data.gamesJoinable;
      $scope.gamesPlayed = data.gamesPlayed;
    })
    .catch(function(err){
    });

    io.socket.on('game', function(message) {
      if (message.verb == "created") {
        $scope.gamesJoinable.push(message.data);
      }
      else if (message.verb == "updated") {
        var cmp = function(g) {return g.id == message.id;};
        var game = _.find($scope.gamesInProgress, cmp) || _.find($scope.gamesJoinable, cmp);
        if (game) {
          _.extend(game, message.data);
          if (message.data.winner) {
            $scope.gamesInProgress = _.reject($scope.gamesInProgress, cmp);
            $scope.gamesPlayed.push(game);
          }
        }
      }
      $scope.$apply();

    });

    $scope.newGame = function() {
      $api.newGame();
    };

    $scope.playGame = function(gameId) {
      window.location = "/game/" + gameId + "/play";
    };

    $scope.joinGame = function(gameId) {
      $api.joinGame(gameId);
    };

  }
]);
