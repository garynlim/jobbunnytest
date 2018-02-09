angular.module('jobBunny').directive('appAlert', appAlert);

function appAlert() {
  return {
    restrict: 'E',
    templateUrl: 'angular-app/alerts/alerts-directive.html'
  }
}