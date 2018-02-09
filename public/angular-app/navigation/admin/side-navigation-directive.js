angular.module('jobBunny').directive('sideNavigation', appAlert);

function appAlert() {
  return {
    restrict: 'E',
    templateUrl: 'angular-app/navigation/admin/side-navigation.html'
  }
}