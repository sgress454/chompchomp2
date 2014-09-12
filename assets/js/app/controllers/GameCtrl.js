angular.module('chompchomp').controller('GameCtrl', [

  '$rootScope',
  '$scope',
  '$element',
  '$q',
  'api',

  function($rootScope, $scope, $element, $q, $api) {

    $scope.$watch("gameId", function(newVal) {
      $api.getGame($scope.gameId).then(function(game) {
        window.scope = $scope;
        $scope.game = game;
        $scope.board = $scope.game.board;
        $scope.player = $scope.chomp.user.id == $scope.game.player1.id ? 1 : 2;
        $scope.turn = $scope.game.turn;

        $scope.$watch("turn", function(newVal) {

          $scope.destinations = [];
          $scope.mobilePieces = [];

          if ($scope.turn == $scope.player) {
            machines['get-mobile-pieces'].configure({game: $scope.game, player: $scope.player}).exec({
              success: function(pieces) {
                $scope.mobilePieces = pieces;
              }
            });
          }
        });

      });
    });

    io.socket.on('game', function(message) {
      if (message.id == $scope.gameId) {
        if (message.verb == "messaged" && message.data.action == "move") {
          var response = message.data;
          $scope.previousBoard = _.clone($scope.board);
          $scope.currentBoard = _.clone(response.board);
          $scope.lastMove = response;
          $scope.game.board = $scope.board = $scope.currentBoard;
          $scope.turn = response.turn;
          $scope.winner = response.winner;
          $scope.selectedTile = null;
          $scope.destinations = [];
          if ($scope.turn == $scope.player) {
            machines['get-mobile-pieces'].configure({game: $scope.game, player: $scope.player}).exec({
              success: function(pieces) {
                $scope.mobilePieces = pieces;
              }
            });
          }
          $scope.replayLastMove();
        }
      }
    });


    $scope.replayLastMove = function() {
      $scope.board = $scope.previousBoard;
      $scope.$apply();

      setTimeout(function(){
        machines['calc-offset'].configure({
          boardsize: $scope.game.boardSize,
          tilesize: 50,
          from: $scope.lastMove.from,
          to: $scope.lastMove.to
        }).exec({
          success: function(offset) {
            movePiece($scope.lastMove.from, $scope.lastMove.lastTurn, offset.x, offset.y, offset.jump, function() {
              if ($scope.lastMove.captured.length) {
                var tile = $($element).find('[data-tile='+$scope.lastMove.from+']');
                tile.css('zIndex', 200);
                var capturePromises = [];
                _.each($scope.lastMove.captured, function(capturedPiece) {
                  var capturePromise = $q.defer();
                  capturePromises.push(capturePromise.promise);
                  machines['calc-offset'].configure({
                    boardsize: $scope.game.boardSize,
                    tilesize: 50,
                    from: $scope.lastMove.to,
                    to: capturedPiece
                  }).exec({
                    success: function(offset) {
                      movePiece($scope.lastMove.to, $scope.lastMove.lastTurn, offset.x, offset.y, false, function() {
                        capturePromise.resolve();
                      });
                    }
                  });
                  var chompPromise = $q.defer();
                  capturePromises.push(chompPromise);
                  chompPiece(capturedPiece, function() {
                    chompPromise.resolve();
                  });
                });
                $q.all(capturePromises).then(function() {
                  tile.css('zIndex', 1);
                  $('.clone').remove();
                  $scope.board = $scope.currentBoard;
                });
              } else {
                $('.clone').remove();
                $scope.board = $scope.currentBoard;
                $scope.$apply();
              }
            });

            // var el = $($element);
            // var tile = el.find('[data-tile='+$scope.lastMove[0]+']');
            // tile.css('zIndex',100);
            // var piece = tile.find('.piece');
            // var clone = createPiece($scope.turn == 1 ? 2 : 1).appendTo(piece.parent());
            // clone.css('zIndex', 100);
            // if (offset.jump) {
            //   piece.remove();
            // }
            // setTimeout(function(){
            //   move(clone[0]).to(offset.x, offset.y).end(function(){
            //     clone.remove();
            //     $scope.board = $scope.currentBoard;
            //     $scope.$apply();
            //     tile.css('zIndex',1);
            //   });
            // });
          }
        });
      }, 500);

    };

    $scope.isMobile = function(tile) {
      return $scope.mobilePieces.indexOf(tile.toString())!==-1;
    };

    $scope.isDestination = function(tile) {
      return $scope.destinations.indexOf(tile)!==-1;
    };

    $scope.getWinner = function() {
      return $scope.game['player'+$scope.winner];
    };

    $scope.clickTile = function(tile) {

      if ($scope.isMobile(tile)) {
        $scope.selectedTile = tile;
        machines['get-moves'].configure({game: $scope.game, from: tile}).exec({
          success: function(tiles) {
            console.log(tiles);
            $scope.destinations = tiles;
          }
        });
      }

      else if ($scope.isDestination(tile)) {
        $api.move($scope.gameId, $scope.selectedTile, tile);
      }

      else {
        $scope.selectedTile = null;
        $scope.destinations = [];
      }

    };

    function movePiece(tileNum, player, x, y, jump, cb) {
      var el = $($element);
      var tile = el.find('[data-tile='+tileNum+']');
      tile.css('zIndex',100);
      var piece = tile.find('.piece');
      var clone = createPiece(player).appendTo(piece.parent());
      clone.css('zIndex', 100);
      if (jump) {
        piece.remove();
      }
      var forceLayout = clone[0].clientHeight;
      move(clone[0]).to(x, y).end(function(){
        tile.css('zIndex',1);
        cb();
      });
    }

    function chompPiece(tileNum, cb) {
      var el = $($element);
      var tile = el.find('[data-tile='+tileNum+']');
      tile.css('zIndex',100);
      var piece = tile.find('.piece');
      move(piece[0]).scale(0.1).set('opacity',0).end(function(){
        piece.remove();
        cb();
      });
    }

    function createPiece(player) {
      return $('<div class="player'+player+' piece clone"></div>');
    }

  }
]);
