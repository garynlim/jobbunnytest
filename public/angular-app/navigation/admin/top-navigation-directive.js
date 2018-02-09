angular.module('jobBunny').directive('topNavigation', appAlert);

function appAlert() {
  return {
    restrict: 'E',
    templateUrl: 'angular-app/navigation/admin/top-navigation.html'
  }
}