angular.module('jobBunny').controller('loginController', loginController);

function loginController($http, $location, $window, AuthFactory, jwtHelper) {
  var vm = this;
  vm.title = "login";

  vm.isLoggedIn = function() {
   if(AuthFactory.isLoggedIn) {
      return true;
    } else {
      return false;
    }
  }

  vm.login = function() {
    vm.error = null;
    vm.message = null;

    if (vm.username && vm.password) {
      var user = {
        username: vm.username,
        password: vm.password
      }
      $http.post('/api/users/login', user).then(function(response){
        console.log('login', response);
        if (response.data.success) {
          // store token in sessionStorage
          $window.sessionStorage.token = response.data.token;
          AuthFactory.isLoggedIn = true;
          var token = $window.sessionStorage.token;
          var decodedToken =  jwtHelper.decodeToken(token);
          vm.loggedInUser = decodedToken.username;
          vm.title = 'Welcome ' + vm.loggedInUser;
          // set message to display after successful login
          vm.message = 'Sucessfully logged in';
          $window.location.href = '/admin';
        }
      }).catch(function(error){
        vm.error = error.data;
      });
    } else {
      vm.error = 'Please enter username and password.';
    }
  }

  vm.logout = function() {
    AuthFactory.isLoggedIn = false;
    delete $window.sessionStorage.token;
    $location.path('/');
  }

  vm.isActiveTab = function(url) {
    var currentPath = $location.path().split('/')[1];
    return (url === currentPath.url ? 'active' : '')
  }
}