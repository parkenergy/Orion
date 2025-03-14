angular.module("Orion.Controllers", []);
angular.module("Orion.Components", []);
angular.module("Orion.Directives", []);
angular.module("CommonControllers", []);
angular.module("CommonComponents", []);
angular.module("CommonDirectives", []);
angular.module("CommonServices", ["ngRoute", "ngResource", "ngCookies"]);
angular.module("Orion.Services", [
    "ngRoute",
    "ngResource",
    "ngCookies",
    "ui.utils"
]);
//  *********test uri

function getRedirectUri(uri) {
	try {
    return (!isUndefined(uri))
      ? ("" + ($window.location.origin) + uri)
      : $window.location.origin
  } catch (e) {}

  return uri || null;
}


angular.module("Orion", [
    "CommonControllers",
    "CommonComponents",
    "CommonDirectives",
    "CommonServices",
    "Orion.Controllers",
    "Orion.Components",
    "Orion.Directives",
    "Orion.Services",
    "UnitApp",
    "InventoryTransfersApp",
    "PartOrderApp",
    "CallReportApp",
    "WorkOrderApp",
    "MCDiligenceApp",
    "ui.bootstrap",
    "ui.utils",
    "satellizer"
]);

angular
    .module("Orion")
    .config([
        "$routeProvider",
        "$authProvider",
        function($routeProvider, $authProvider) {
            $routeProvider

                .when("/", {
                    controller: "LoginCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/clientLogin.html"
                })

                .when("/myaccount", {
                    needsLogin: true,
                    controller: "MyAccountCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/myaccount.html",
                    resolve: {
                        users: function($route, $q, Users) {
                            return Users.query({ size: 100000 }).$promise;
                        },
                        units: function($route, $q, Units) {
                            return Units.query({ size: 100000 }).$promise;
                        }
                    }
                })

                .when("/areapmreport/:name", {
                    needsLogin: true,
                    controller: "AreaPMReportCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/areapmreport.html",
                    resolve: {
                        users: function($route, $q, Users) {
                            let locationName = $route.current.params.name;
                            return Users.query({
                                regexArea: locationName,
                                size: 100000
                            }).$promise;
                        },
                        units: function($route, $q, Units) {
                            return Units.query({ size: 100000 }).$promise;
                        },
                        areaName: function($route) {
                            return $route.current.params.name;
                        }
                    }
                })

                .when("/areapmreport/:name/:user", {
                    needsLogin: true,
                    controller: "UserPMReportCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/userpmreport.html",
                    resolve: {
                        users: function($route, $q, Users) {
                            let username = $route.current.params.user;
                            return Users.query({ userName: username }).$promise;
                        }
                    }
                });
            //redirectUri: window.location.origin,    ***********  getRedirectUri(),
            $authProvider.google({
                url: "/auth/google",
                authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
                redirectUri: window.location.origin,//"http://orion.parkenergyservices.com/#/",
                requiredUrlParams: ["scope"],
                optionalUrlParams: ["display"],
                scope: ["profile", "email"],
                scopePrefix: "openid",
                scopeDelimiter: " ",
                display: "popup",
                type: "2.0",
                setApprovalPrompt: "force",
                popupOptions: { width: 452, height: 833 },
                clientId: "24229647507-pvt4ttv086umiomjpgv7f1r2d5rc9nr7.apps.googleusercontent.com",
                client_secret: "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",
                responseType: "token"
            });
            $authProvider.live({
                url: "/auth/live",
                authorizationEndpoint: "https://login.microsoftonline.com/e5864ec5-caf0-43c7-a927-b544377a8781/oauth2/v2.0/authorize",//"https://login.live.com/oauth20_authorize.srf",
                redirectUri: window.location.origin,//"http://orion.parkenergyservices.com/#/",
                requiredUrlParams: ["scope"/*, "display"*/],
                scope: ["openid"/*"wl.emails"*/],
                scopeDelimiter: " ",
                display: "popup",
                type: "2.0",
                setApprovalPrompt: "force",
                popupOptions: { width: 452, height: 833 },
                clientId: "1478f42d-d1e1-4f76-92f0-1a7088e13232",
                client_secret: "obI8Q~jT5_nXagCXtCH0FFsSuqfYC6l~uP5KuaxN",
                responseType: "token"
            });
            //clientId: "402483966217-5crk767d69pcn25dhds4htv3o67kdpuc.apps.googleusercontent.com",
            //client_secret: "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",
            $authProvider.httpInterceptor = function() {
                return true;
            };
            //$authProvider.withCredentials = true;
            //$authProvider.tokenRoot = null;
            //$authProvider.baseUrl = "/";
            //$authProvider.loginUrl = "/auth/login";
            //$authProvider.tokenPath = "access_token"; 
            //$authProvider.signupUrl = "/auth/signup";
            //$authProvider.unlinkUrl = "/auth/unlink/";
            $authProvider.tokenName = "token";
            $authProvider.tokenPrefix = "satellizer";
            //$authProvider.authHeader = "Authorization";
            $authProvider.authToken = "Bearer";
            $authProvider.storageType = "localStorage";
        }
    ])
    .factory("authProvider", [
        "$cookies",
        "$location",
        "SessionService",
        function($cookies, $location, SessionService) {
            return {
                isLoggedIn: function() {
                    const currentPath = $location.path();
                    const SS = SessionService;

                    if (
                        !$cookies.get("tech") ||
                        !localStorage.getItem("satellizer_token") ||
                        !SS.get("loggedIn")
                    ) {
                        if (currentPath !== "/") {
                            SS.add("loggedIn", true);
                            $cookies.put("OrionNotLoggedInRoute", currentPath);
                        }
                        return false;
                    } else {
                        return true;
                    }
                }
            };
        }
    ])
    .run([
        "$rootScope",
        "$location",
        "authProvider",
        function($rootScope, $location, authProvider) {
            $rootScope.$on("$routeChangeStart", function(event) {
                const currentPath = $location.path();
                const regex = new RegExp("/wpi", "i");
                if (!regex.test(currentPath)) {
                    if (!authProvider.isLoggedIn()) {
                        // event.preventDefault();
                        $location.path("/");
                    } else {
                        console.log("here?");
                    }
                }
            });
        }
    ]);

/* Handle errors from the server side
  ----------------------------------------------------------------------------- */
// angular.module('Orion').config(['$httpProvider',
// function ($httpProvider) {
//   $httpProvider.interceptors.push('Handler401');
// }]);
