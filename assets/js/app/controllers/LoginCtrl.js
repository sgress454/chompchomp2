angular.module('chompchomp').controller('LoginCtrl', [

  '$rootScope',
  '$scope',
  '$element',
  'api',

  function($rootScope, $scope, $element, $api) {
    $($element).find('.submit').click(function(e) {
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
