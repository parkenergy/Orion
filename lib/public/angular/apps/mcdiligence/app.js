angular.module('MCDiligenceApp.Controllers', []);
angular.module('MCDiligenceApp.Directives', ['uiGmapgoogle-maps']);
angular.module('MCDiligenceApp.Components', []);
angular.module('MCDiligenceApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('MCDiligenceApp', [
    'MCDiligenceApp.Controllers',
    'MCDiligenceApp.Directives',
    'MCDiligenceApp.Services',
    'MCDiligenceApp.Components',
    'infinite-scroll',
]);

angular.module('MCDiligenceApp').config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider

            .when('/mcdiligence/view/:id?', {
                controller:  'MCDiligenceReviewCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/mcUnitDFReview.html',
                resolve:     {
                    mcDiligenceForm: function ($route, $q, MCUnitDiligenceForms) {
                        return MCUnitDiligenceForms.get({id: $route.current.params.id}).$promise;
                    },
                },
            })
            .when('/wpi/view/:id?', {
                controller:  'MCDiligenceReviewCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/wpiUnitDFReview.html',
                resolve:     {
                    mcDiligenceForm: function ($route, $q, MCUnitDiligenceForms) {
                        return MCUnitDiligenceForms.get({id: $route.current.params.id}).$promise
                    },
                },
            })

            /*.when('/unit/page/:coords?', {
                controller: 'UnitPageCtrl',
                templateUrl: '/lib/public/angular/apps/unit/views/page.html',
                resolve: {
                    coords: function ($route) {
                        const coords = $route.current.params.coords.split(',');
                        return [+coords[1], +coords[0]];
                    }
                }
            })*/

            .when('/mcdiligence', {
                controller:  'MCDiligenceCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/mcDiligenceOverview.html',
            })

            // specific wpi endpoint
            .when('/wpi', {
                controller:  'MCDiligenceCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/wpiDiligenceOverview.html',
            });
    }]);
