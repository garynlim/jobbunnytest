angular.module('jobBunny').controller('registerController', registerController);

function registerController($http) {
  var vm = this;
  vm.title = "Registration";

  vm.register = function() {
    var user = {
      username: vm.username,
      password: vm.password
    };

    if (!vm.username && !vm.password) {
      vm.error = 'Please add a username and password';
    } else {
      if (vm.password !== vm.passwordRepeat) {
        vm.error = 'Please make sure password matches repeat password';
      } else {
        $http.post('/api/users/register/', user).then(function(result){
          console.log(result);
          vm.error = null;
          vm.message = "Registration successful. Please login"
        }).catch(function(error){
          console.log(error);
          vm.error = error.data.errmsg;
        });
      }
    }
  }
}
