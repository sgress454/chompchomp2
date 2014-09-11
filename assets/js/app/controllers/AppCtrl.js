angular.module('chompchomp').controller('AppCtrl', [

  '$rootScope',
  '$scope',
  '$location',
  'api',

  function($rootScope, $scope, $location, $api) {

    // Define snappy object on rootScope
    $rootScope.chomp = {};

    // If there are any sails locals, merge them in
    if (SAILS_LOCALS) {
      angular.extend($rootScope.chomp, SAILS_LOCALS);
    } else {
      $api.getProfile()
      .then(function(data) {
        // User is logged in, set on rootScope
        $rootScope.chomp.user = data;
      })
      .catch(function(err){
        // No user logged in
        $rootScope.chomp.user = null;
      });
    }
  }

]);
