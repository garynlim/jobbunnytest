angular.module('jobBunny', ['ngRoute', 'angular-jwt']).config(config).run(run);

function config($httpProvider, $routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'angular-app/user-register/register.html',
    controller: registerController,
    controllerAs: 'vm',
    access: {
      restricted: false
    }
  })
  .when('/login', {
    templateUrl: 'angular-app/user-login/login.html',
    controller: loginController,
    controllerAs: 'vm',
    access: {
      restricted: false
    }
  })
  .otherwise({
    redirectTo: '/'
  });
}

function run($rootScope, $window, $location, AuthFactory) {
  $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
    if (nextRoute.access !== undefined && nextRoute.access.restricted && !$window.sessionStorage.token && !AuthFactory.isLoggedIn) {
      event.preventDefault();
      $location.path('/');
    }
  });
}
