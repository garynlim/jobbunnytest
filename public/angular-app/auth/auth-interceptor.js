// This can be used in angular routes to intercept incoming request and verify authorization to access \
// certain angular-app URLs which are only accessible to authenticated users
angular.module('jobBunny').factory('AuthInterceptor', AuthInterceptor);

function AuthInterceptor($location, $q, $window, AuthFactory) {
  return {
    request: request,
    response: response,
    responseError: responseError
  }

  function request(config) {
    config.headers = config.headers || {};
    if ($window.sessionStorage.token) {
      config.headers.Authorization = "Bearer " + $window.sessionStorage.token;
    }
    return config;
  }

  function response(response) {
    if (response.status === 200 && $window.sessionStorage.token && !AuthFactory.isLoggedIn) {
      AuthFactory.isLoggedIn = true;
    }
    if (response.status === 401) {
      AuthFactory.isLoggedIn = false;
    }
    return response || $q.when(response);
  }

  function responseError(rejection) {
    if (response.status === 401 || response.status === 403) {
      delete $window.sessionStorage.token;
      AuthaFactory.isLoggedIn = false;
      $location.path('/');
    }
    return $q.reject(rejection);
  }
}