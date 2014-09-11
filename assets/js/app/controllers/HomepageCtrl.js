angular.module('chompchomp').controller('HomepageCtrl', [

  '$rootScope',
  '$scope',
  'api',

  function($rootScope, $scope, $api) {

    $('.submit').click(function(e) {
      e.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      $api.login(email, password)
        .then(function() {
          window.location="/dashboard";
        })
        .catch(function() {
          console.log("NOPE");
        });
    });

  }
]);
