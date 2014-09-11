angular.module('chompchomp').controller('GameCtrl', [

  '$rootScope',
  '$scope',
  'api',

  function($rootScope, $scope, $api) {

    $scope.$watch("gameId", function(newVal) {
      $api.getGame($scope.gameId).then(function(game) {
        window.scope = $scope.game = game;
        $scope.board = _.values($scope.game.board);
        $scope.player = $scope.chomp.user.id == $scope.game.player1.id ? 1 : 2;
        console.log($scope.board);
      });
    });

  }
]);
