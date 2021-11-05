angular.module('CommonControllers').controller('LoginCtrl',
    ['$scope', '$http', '$location', '$routeParams', '$window', '$cookies', 'AlertService', 'Users', '$auth',
        function ($scope, $http, $location, $routeParams, $window, $cookies, AlertService, Users, $auth) {

            $scope.hideLocalLogin = false;
            $scope.title = "Login";
            $scope.message = "Use your local login to access the system.";

            $scope.returnUrl = $routeParams.returnUrl;
          
            $scope.fragment = $routeParams.fragment;
            console.log($scope.returnUrl );
            console.log($scope.fragment);
            
            $location.search({});

            if ($routeParams.failure === "true") {
                AlertService.add("info", "We were unable to log you in. Please try again.");
            }

            $scope.localLogin = function () {
                console.log("localLogin");
               $scope.username =document.getElementById('username').value; 
                $scope.username = $scope.username.toUpperCase();
                console.log($scope.username);
                  $cookies.put('tech', $scope.username);
                 $cookies.put('role', res.data.role);
                console.log('cookie' + $scope.username);
                AlertService.add("info", "Local Login Successful!", 1000);
                  $http.get('/api/identify')
                            .then(function (res) {
                                console.log('authorized');
                                console.log("Authed as: ", res.data.username);
                                $cookies.put('tech', res.data.username || "Logged Out");
                                $cookies.put('role', res.data.role);
                                const OrionNotLoggedInRoute = $cookies.get('OrionNotLoggedInRoute');
                                if (OrionNotLoggedInRoute) {
                                    $cookies.remove('OrionNotLoggedInRoute');
                                    $location.path(OrionNotLoggedInRoute);
                                } else {
                                    $location.path('myaccount');
                                }
                      
                $location.path($scope.fragment || "myaccount");
            };

            $scope.authenticate = function (provider) {
                console.log("authenticate called");
                $auth.authenticate(provider)
                    .then(function () {
                        $http.get('/api/identify')
                            .then(function (res) {
                                console.log('authorized');
                                console.log("Authed as: ", res.data.username);
                                $cookies.put('tech', res.data.username || "Logged Out");
                                $cookies.put('role', res.data.role);
                                
                                    $cookies.remove('OrionNotLoggedInRoute');
                            
                                    $location.path('myaccount');
                                
                            }).catch(function (res) {
                            console.log('did not auth');
                            AlertService.add("danger", res, 1000);
                        })
                    })
                    .catch(function (err) {
                        console.log(err);
                        AlertService.add("danger", "Login Failed!", 1000);
                    });
            };

            $scope.showLocalLogin = function () {
                $scope.hideLocalLogin = false;
            };
        }]);
