angular.module('chompchomp').controller('SignupCtrl', [

  '$rootScope',
  '$scope',
  '$element',
  'api',

  function($rootScope, $scope, $element, $api) {
    $($element).find('.submit').click(function(e) {
      e.preventDefault();
      var firstName = $($element).find('[name=firstName]').val();
      var lastName = $($element).find('[name=lastName]').val();
      var email = $($element).find('[name=email]').val();
      var password = $($element).find('[name=password]').val();
      var confirmpassword = $($element).find('[name=confirmpassword]').val();
      if (password != confirmpassword) {
        alert('Passwords must match');
      }
      $api.signup({firstName: firstName, lastName: lastName, email: email, password: password})
        .then(function() {
          window.location="/dashboard";
        })
        .catch(function() {
          console.log("NOPE");
        });
    });
  }
]);
