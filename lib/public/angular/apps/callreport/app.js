/**
 *            app.js
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */

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
      controller: 'CallReportCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crOverview.html',
      resolve: {
        callreport: function ($route, $q, CallReports) {
          var id = $route.current.params.id || 0;
          var deferred = $q.defer();
          if (id) {
            CallReports.get({id: id},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          } else {return null;}
          return deferred.promise;
        }
      }
    })
    .when('/callreport/edit/:id',{
      needsLogin: true,
      controller: 'CallReportCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crOverview.html',
      resolve: {
        callreport: function ($route, $q, CallReports) {
          var id = $route.current.params.id || 0;
          var deferred = $q.defer();
          if (id) {
            CallReports.get({id: id},
              function (res) { return deferred.resolve(res); },
              function (err) { return deferred.reject(err); });
          } else {return null;}
          return deferred.promise;
        },
        unittypes: function ($route, $q, UnitTypes) {
          var deferred = $q.defer();
          UnitTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        titles: function ($route, $q, Titles) {
          var deferred = $q.defer();
          Titles.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        statustypes: function ($route, $q, StatusTypes) {
          var deferred = $q.defer();
          StatusTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        opportunitysizes: function ($route, $q, OpportunitySizes) {
          var deferred = $q.defer();
          OpportunitySizes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        opptypes: function ($route, $q, OppTypes) {
          var deferred = $q.defer();
          OppTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        activitytypes: function ($route, $q, ActivityTypes) {
          var deferred = $q.defer();
          ActivityTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        }
      }
    })
    .when('/callreport/create',{
      needsLogin: true,
      controller: 'CallReportCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crOverview.html',
      resolve: {
        callreports: function ($route, $q, CallReports) {
          var deferred = $q.defer();
          CallReports.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        unittypes: function ($route, $q, UnitTypes) {
          var deferred = $q.defer();
          UnitTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        titles: function ($route, $q, Titles) {
          var deferred = $q.defer();
          Titles.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        statustypes: function ($route, $q, StatusTypes) {
          var deferred = $q.defer();
          StatusTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        opportunitysizes: function ($route, $q, OpportunitySizes) {
          var deferred = $q.defer();
          OpportunitySizes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        opptypes: function ($route, $q, OppTypes) {
          var deferred = $q.defer();
          OppTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        },
        activitytypes: function ($route, $q, ActivityTypes) {
          var deferred = $q.defer();
          ActivityTypes.query({},
            function (res) { return deferred.resolve(res); },
            function (err) { return deferred.reject(err); });
          return deferred.promise;
        }
      }
    });
  }
]);


