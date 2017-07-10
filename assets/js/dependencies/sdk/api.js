angular.module('chompchomp_api', []);
angular.module('chompchomp_api').factory('api', [

/**
 * File Dependencies
 */

         '$http', '$timeout', '$q', 'chompchomp_endpoints',
function( $http,  $timeout, $q, chompchomp_endpoints) {

  var CONSTANTS = window.CONSTANTS || {};

  CONSTANTS.apiUrl = CONSTANTS.apiUrl || (location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: ''));

  $http.defaults.withCredentials = true;

  // Attempt to get a CSRF token right away, so that requests that might need one don't have
  // to wait for it.
  var getCSRF = $http.get('/csrfToken', { withCredentials: true })
  .then(function(res) {
    $http.defaults.headers.common['x-csrf-token'] = res.data._csrf;
  })
  .catch(function(res) {
    return res;
  });

  /**
   * API
   *
   * @class        {angular.factory}
   * @module       chompchomp
   * @type         {Object}
   * @description  Collection of methods for storing, retrieving, modifying
   *               and deleting data.
   */

  var api = {};

  Object.keys(chompchomp_endpoints).forEach(function(methodName) {
    var requestFn = chompchomp_endpoints[methodName];
    api[methodName] = function() {
      var request = requestFn.apply(this, Array.prototype.slice.apply(arguments));
      return promise(request);
    };
  }, api);


  return api;

  function promise(request) {

    if (request.url.substr(0,4) != 'http') {
      request.url = request.url;
    }

    // Default to GET method
    request.method = (request.method || "get").toLowerCase();

    // Create a new deferred object
    var deferred = $q.defer();

    // If this is a get request, just set up the promise
    if (request.method == "get") {
      setupPromise();
    }

    // Otherwise make sure that we have the CSRF token first
    else {
      getCSRF.then(setupPromise);
    }

    // Return the promise
    return deferred.promise;

    // Set up the promise which wraps a socket request
    function setupPromise() {

      return io.socket.request({url: request.url, params: request.params, method: request.method}, function(data, response, headers) {

        if (response.statusCode !== 200) {
          deferred.reject(anAPIError(data, response.statusCode, headers));
        } else {
          deferred.resolve(data, response.statusCode, headers);
        }

      });

    }
  }

  /**
   * Build an API error object.
   *
   * @param  {HTTP} res
   * @return {Error}
   * @private
   */

  function anAPIError(data, status, headers, config) {
    var err = new Error();
    err.name = 'APIError';
    err.code = 'E_API';
    err.message = 'Error communicating with API backend @ "'+(config && config.url)+'" :: ';
    err.message += status ;
    try {
      err.message += ' ('+data+') ';
    }
    catch (stringifyErr) { }
    err.data = data;
    return err;
  }

}])

.provider('chompchomp_endpoints', function() {
  var endPoints = {};
  this.$get = function() {
    return endPoints;
  };
});
