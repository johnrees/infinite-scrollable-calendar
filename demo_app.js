var app = angular.module('demoApp', ['scrollableCalendarModule']);

app.controller('demoAppController', function($scope) {
   $scope.startDate = '2013-09-19';
   $scope.endDate = '2013-09-27';
});