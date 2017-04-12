angular.module('CallReportApp.Controllers', []);
angular.module('CallReportApp.Components', []);
angular.module('CallReportApp.Directives', []);
angular.module('CallReportApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('CallReportApp', [
  'CallReportApp.Controllers',
  'CallReportApp.Components',
  'CallReportApp.Directives',
  'CallReportApp.Services',
  'infinite-scroll'
]);

angular.module('CallReportApp').config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
    .when('/callreport', {
      needsLogin: true,
      controller: 'CallReportCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crOverview.html'
    })
    .when('/callreport/review/:id',{
      needsLogin: true,
      controller: 'CallReportReviewCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crReview.html',
      resolve: {
        callreport: function ($route, $q, CallReports) {
          const id = $route.current.params.id || 0;
          return (id) ? CallReports.get({id}).$promise : null;
        }
      }
    })
    .when('/callreport/edit/:id',{
      needsLogin: true,
      controller: 'CallReportEditCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crEdit.html',
      resolve: {
        callreport: function ($route, $q, CallReports) {
          const id = $route.current.params.id || 0;
          return (id) ? CallReports.get({id}).$promise : null;
        },
        unittypes: function ($route, $q, UnitTypes) {
          return UnitTypes.query({}).$promise;
        },
        titles: function ($route, $q, Titles) {
          return Titles.query({}).$promise;
        },
        statustypes: function ($route, $q, StatusTypes) {
          return StatusTypes.query({}).$promise;
        },
        opportunitysizes: function ($route, $q, OpportunitySizes) {
          return OpportunitySizes.query({}).$promise;
        },
        opptypes: function ($route, $q, OppTypes) {
          return OppTypes.query({}).$promise;
        },
        activitytypes: function ($route, $q, ActivityTypes) {
          return ActivityTypes.query({}).$promise;
        },
        customers: function ($route, $q, Customers) {
          return Customers.query({}).$promise;
        },
        applicationtypes: function ($route, $q, ApplicationTypes) {
          return ApplicationTypes.query({}).$promise;
        },
        users: function ($route, $q, Users) {
          return Users.query({}).$promise;
        }
      }
    })
    .when('/callreport/create',{
      needsLogin: true,
      controller: 'CallReportCreateCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crCreate.html',
      resolve: {
        unittypes: function ($route, $q, UnitTypes) {
          return UnitTypes.query({}).$promise;
        },
        titles: function ($route, $q, Titles) {
          return Titles.query({}).$promise;
        },
        statustypes: function ($route, $q, StatusTypes) {
          return StatusTypes.query({}).$promise;
        },
        opportunitysizes: function ($route, $q, OpportunitySizes) {
          return OpportunitySizes.query({}).$promise;
        },
        opptypes: function ($route, $q, OppTypes) {
          return OppTypes.query({}).$promise;
        },
        activitytypes: function ($route, $q, ActivityTypes) {
          return ActivityTypes.query({}).$promise;
        },
        applicationtypes: function ($route, $q, ApplicationTypes) {
          return ApplicationTypes.query({}).$promise;
        }
      }
    });
  }
]);


