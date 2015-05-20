angular.module('Orion.Controllers', []);
angular.module('Orion.Directives', []);
angular.module('Orion.Services', ['ngRoute', 'ngResource', 'ngCookies']);

angular.module('Orion', [
  'Orion.Controllers',
  'Orion.Directives',
  'Orion.Services',
  'CustomerApp',
  'LocationApp',
  'PartApp',
  'ServicePartnerApp',
  'TransferApp',
  'UnitApp',
  'UserApp',
  'VendorApp',
  'VendorPartApp',
  'WorkOrderApp',
  'ui.bootstrap',
  'ui.utils'
]);

angular.module('Orion').config(['$routeProvider',
function ($routeProvider) {
  $routeProvider
  .when('/login', {
    controller: 'SessionCtrl',
    templateUrl: '/app/views/redirecting.html',
  })
  .when('/myaccount', {
    needsLogin: true,
    controller: 'MyAccountCtrl',
    templateUrl: '/app/views/myaccount.html',
    resolve: {
      workorders: function($route, $q, WorkOrders) {
        var deffered = $q.defer();
        var now = new Date();
        var DaysAgo30 = now.setDate(now.getDate()-30);
        var temp;
        WorkOrders.query({limit: 50, where: {status: "SUBMITTED"}},
          function (response) {
            return deffered.resolve(response);
            //temp = response;
            // WorkOrders.query({limit: 200, where: { updatedAt: {gte: DaysAgo30}, status: "APPROVED" } },
            //   function (response) {
            //     temp = temp.concat(response);
            //     return deffered.resolve(temp);
            //   },
            //   function (err) { return deffered.reject(err); }
            // );
          },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })
  .when('/', {
    controller: 'HomepageCtrl',
    templateUrl: '/app/views/homepage.html'
  });
}]);


/* Handle errors from the server side
----------------------------------------------------------------------------- */
angular.module('Orion').config(['$httpProvider',
function ($httpProvider) {
  $httpProvider.interceptors.push('Handler401');
}]);

angular.module('Orion.Controllers').controller('DashboardCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
  function ($scope, $route, $location, AlertService, LoaderService) {

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

    $scope.sort = {
      column: ["status", "date", "number"],
      descending: [true],
    };

    $scope.workorders.forEach(function (wo) {
      var displayName = "";
      if (!wo.unit || !wo.unit.location || !wo.unit.location.name) {
        // do nothing
      } else if (wo.unit.location.name.length <= 20) {
        wo.displayLocationName = wo.unit.location.name;
      } else {
        wo.displayLocationName = wo.unit.location.name.slice(0,17) + "...";
      }

      displayName = "";
      if (!wo.unit || !wo.unit.location || !wo.unit.location.customer || !wo.unit.location.customer.dbaCustomerName) {
        // do nothing
      } else if (wo.unit.location.customer.dbaCustomerName.length <= 20) {
        wo.displayCustomerName = wo.unit.location.customer.dbaCustomerName;
      } else {
        wo.displayCustomerName = wo.unit.location.customer.dbaCustomerName.slice(0,17) + "...";
      }
    });

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);

angular.module('Orion.Controllers').controller('HomepageCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
	function ($scope, $route, $location, AlertService, LoaderService) {

		$scope.title = "Park Energy";
		$scope.message = "field asset management";

		$scope.myAccount = function () {
			$location.path('/myaccount');
		};

}]);

angular.module('Orion.Controllers').controller('MyAccountCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, workorders, role) {

    $scope.title = "My Account";
    $scope.workorders = workorders;
    $scope.role = role;

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

}]);

angular.module('Orion.Controllers').controller('NSTCtrl',
['$scope', 'AlertService', 'LoaderService', 'ArrayFilterService',
  function ($scope, AlertService, LoaderService, ArrayFilterService) {

    $scope.expandedRows = [];

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.toggleExpandObject = function (obj) {
      if (obj._nestedObjects) {
        obj.isRowExpanded = !obj.isRowExpanded;
      }
    };


    /* -------------------------------------------------------------------------
    CONFIGURATION / ON LOAD
    ------------------------------------------------------------------------- */
    $scope.getDefaultSort = function () {
      var column = [];
      for (var key in $scope.displayColumns) { column.push(key.toString()); }
      $scope.defaultSort = { column: column, descending: [false] };
    };

    $scope.configureColumnSizes = function () {
      if (!$scope.columnSizes) { $scope.columnSizes = []; }
      var a = $scope.displayColumns.length + $scope.headerButtons.length;
      var b = $scope.displayColumns.length + $scope.rowButtons.length;
      var numberOfColumns = Math.max(a,b);
      for (var i = 0; i < numberOfColumns; i++) {
        $scope.columnSizes[i] = $scope.columnSizes[i] || "col-xs-1";
      }
    };

    $scope.configureNestedObjects = function () {
      $scope.objectList.forEach(function (ele, arr, ind) {

        ele._nestedObjects = [];
        var objects = ele[$scope.nestedKey];
        if (!objects) { ele._nestedObjects = objects; return; }

        objects.forEach(function (obj) {
          var nestedObject = {};
          for (var i = 0; i < $scope.nestedDisplayColumns.length; i++) {
            var key = $scope.nestedDisplayColumns[i].objKey;
            nestedObject[key] = $scope.getNestedKey(obj, key);
          }
          ele._nestedObjects.push(nestedObject);
        });

      });
    };

    $scope.getNestedKey = function (obj, key) {
      if (!obj || !key) { return obj; }

      var keys = key.split('.');
      for (var i = 0; i < keys.length; i++) {
        obj = obj[keys[i]];
        if (!obj) { return undefined;}
      }
      return obj;
    };

    $scope.onLoad = function () {
      var m = $scope.model;
      // if the required fields are not present, bail out
      if (!m.objectList || !m.displayColumns || !m.nestedKey || !m.nestedDisplayColumns) {
        console.log("WARNING!");
        console.log("You failed to provide required data for the directive.");
        console.log("See TableSortSearch documentation for more info.");
        var errMessage =  "TableSortSearchCtrl: " +
                          "Required attributes were not assigned to model.";
        throw new Error(errMessage);
      } else {
        $scope.tableName = m.tableName || "My Table Name";
        $scope.objectList = m.objectList;
        $scope.displayColumns = m.displayColumns;
        $scope.rowClickAction = m.rowClickAction;
        $scope.headerButtons = m.headerButtons;
        $scope.rowButtons = m.rowButtons;
        $scope.sort = m.sort || $scope.getDefaultSort();
        $scope.columnSizes = m.columnSizes;
        $scope.configureColumnSizes();

        $scope.nestedTableName = m.nestedTableName;
        $scope.nestedKey = m.nestedKey;
        $scope.nestedDisplayColumns = m.nestedDisplayColumns;
        $scope.configureNestedObjects();
      }
    };

    // call on load
    (function () { $scope.onLoad(); })();

}]);

angular.module('Orion.Controllers').controller('SessionCtrl',
['$scope', '$http', '$location', '$routeParams', '$window', 'AlertService',
function ($scope, $http, $location, $routeParams, $window, AlertService) {

  $window.location.href = '/auth/parkenergyidentity';

  $scope.hideLocalLogin = false;
  $scope.title = "Login";
  $scope.message = "Use your local login to access the system.";

	$scope.returnUrl = $routeParams.returnUrl;
	$scope.fragment = $routeParams.fragment;
	$location.search({});

  if($routeParams.failure === "true") {
    AlertService.add("info", "We were unable to log you in. Please try again.");
  }

  $scope.thirdPartyAuth = function (authService) {
    var url = '/auth?authService=' + authService +
    ($scope.returnUrl ? "&returnUrl=" + $scope.returnUrl +
    ($scope.fragment ? "&fragment=" + $scope.fragment : "")
    : "&returnUrl=/#/");

    $window.location.href = url;
  };

	$scope.localLogin = function () {
    $http.post("/auth/local", {email: $scope.email, password: $scope.password})
    .success(function(data, status, headers, config) {
      AlertService.add("info", "Login Successful!", 1000);
      $location.path($scope.fragment || "myaccount");
    }).error(function(data, status, headers, config) {
      AlertService.add("danger", "We couldn't log you in. Please try again.");
    });

	};

	$scope.showLocalLogin = function () {
		$scope.hideLocalLogin = false;
	};

}]);

angular.module('Orion.Controllers').controller('SuperIndexCtrl',
['$scope', 'RedirectService', 'title', 'objectList', 'displayColumns', 'sort', 'rowClickAction', 'rowButtons', 'headerButtons', 'model',
function ($scope, RedirectService, title, objectList, displayColumns, sort, rowClickAction, rowButtons, headerButtons, model) {

  $scope.tableModel = {
    tableName: title,
    objectList: objectList,
    displayColumns: displayColumns || getDisplayColumns,
    sort: sort || getSort(),
    rowClickAction: rowClickAction || getRowClickAction(),
    rowButtons: rowButtons || getRowButtons(),
    headerButtons: headerButtons || getHeaderButtons(),
  };

  function getDisplayColumns () {
    var columns = [];
    var keys = Object.keys(objectList[0]);
    keys.forEach(function (key) {
      if (key == "id") { return; }
      var column = {title: key, objKey: key};
      columns.push(column);
    });
    return columns;
  }

  function getSort () {
    var keys = Object.keys(objectList[0]);
    var key = keys[0];
    if (key == "id") { key = keys[1]; }
    return { column: [key], descending: [false]
    }
  }

  function getRowClickAction () {
    return RedirectService.getEditRedirectFn(model);
  }

  function getRowButtons () {
    return [
      {
        title: "edit",
        action: RedirectService.getEditRedirectFn(model)
      }
    ];
  }

  function getHeaderButtons () {
    return [
      {
        title: "new " + model,
        action: RedirectService.getEditRedirectFn(model)
      }
    ];
  }

}]);

angular.module('Orion.Controllers').controller('STCtrl',
['$scope', 'AlertService', 'LoaderService',
  function ($scope, AlertService, LoaderService) {

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    /* -------------------------------------------------------------------------
    CONFIGURATION / ON LOAD
    ------------------------------------------------------------------------- */
    $scope.getDefaultSort = function () {
      var column = [];
      for (var key in $scope.displayColumns) { column.push(key.toString()); }
      $scope.defaultSort = { column: column, descending: [false] };
    };

    $scope.onLoad = function () {
      var m = $scope.model;

      // if the required fields are not present, bail out
      if (!m.objectList || !m.displayColumns) {
        console.log("WARNING!");
        console.log("You failed to provide required data for the directive.");
        console.log("See TableSortSearch documentation for more info.");
        var errMessage =  "TableSortSearchCtrl: " +
                          "Required attributes were not assigned to model.";
        throw new Error(errMessage);
      } else {
        $scope.tableName = m.tableName || "My Table Name";

        // required variables
        $scope.objectList = m.objectList;
        $scope.displayColumns = m.displayColumns;

        // optional variables
        $scope.rowClickAction = m.rowClickAction;
        $scope.headerButtons = m.headerButtons;
        $scope.rowButtons = m.rowButtons;
        $scope.sort = m.sort || $scope.getDefaultSort();

      }
    };

    // call on load
    (function () { $scope.onLoad(); })();

}]);

angular.module('Orion.Directives')

.directive('alerts', ['AlertService', function (AlertService) {
  return {
    restrict: 'E',
    templateUrl: '/app/views/alerts.html',
    link: function (scope, elem, attrs, ctrl) {
      scope.closeAlert = function (obj) {
      	return AlertService.closeAlert(obj);
      };
  	}
  };
}]);

angular.module('Orion.Directives')
.directive('customValidation', function() {
  return {
    require: 'ngModel',
    scope: true,
    link: function (scope, element, attr, ngModelCtrl) {

      element.bind('focus', function () {
        if (element.context.value === "0") {
          element.context.value = "";
        }
      });


      function fromUser (text) {
        var originalText = text;
        var isNumber = attr.number !== undefined;
        var isTextOnly = attr.textonly !== undefined;
        var isNonNegative = attr.nonNegative !== undefined;
        var isIntegerOnly = attr.integerOnly !== undefined;

        if (isNumber) {
          text = text.replace(/[^-?\d+\.?\d*$]/g,'');
          var decimalCount = 0;

          for (var i = 0; i < text.length; i++) { // because regex is fucky

            if (i === 0 && text[i] === '-') {
              continue;
            } // skip the first negative

            if (text[i] === '-') { // remove subsequent minus signs
              text = text.slice(0, i) + text.slice(i+1, text.length);
            } else if (text[i] === '.') {
              if (decimalCount > 0) { // remove subsequent decimal points
                text = text.slice(0, i) + text.slice(i+1, text.length);
              } else { // there can be only 1
                decimalCount = 1;
              }
            }

          }

          if (isNonNegative) {
            text = text.split('-').join();
          }

          if (isIntegerOnly) {
            text = text.split('.')[0];
          }

        }

        if (isTextOnly) {
          console.log("text only validation not implemented");
        }

        if(text !== originalText) {
            ngModelCtrl.$setViewValue(text);
            ngModelCtrl.$render();
        }
        return text;
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  };
});

angular.module('Orion.Directives')

.directive('dashboard', ['$window', '$location', 'WorkOrders', function ($window, $location, WorkOrders) {
  return {
    restrict: 'E',
    templateUrl: '/app/views/dashboard.html',
    controller: "DashboardCtrl",
    scope: true
  };
}]);

angular.module('Orion.Directives')

.directive('header', ['$window', '$location', function ($window, $location) {
  return {
    restrict: 'E',
    templateUrl: '/app/views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      function getnavItems() {
      	var navItems = [];
      	if ($location.path() === "/") {
      		navItems = [
      			{
      				text: "Login",
      				action: function () { $location.path('/myaccount'); }
      			}
      		];
      	} else {
      		navItems = [
      			{
      				text: "My Account",
      				action: function () { $location.path('/myaccount'); }
      			},
      			{
      				text: "Logout",
      				action: function () { $window.location = 'logout'; }
      			}
      		];
      	}
      	return navItems;
      }

      scope.navItems = getnavItems();
  	}
  };
}]);

angular.module('Orion.Directives')

.directive('nestedSupertable', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      model: '='
    },
    controller: 'NSTCtrl',
    templateUrl: '/app/views/nestedSuperTable.html'
  };
}]);

/* -----------------------------------------------------------------------------
  MODEL FORMAT INFORMATION AND DOCUMENTATION
  ------------------------------------------------------------------------------


  ------------------------------------------------------------------------------
  PropertyName: objectList
  Status: REQUIRED
  Format: [Object Array]
  Description:
  Example:
  REQUIRED - [Object Array] - a data list of objects to show in the table
    model.objectList = [
      {username: "Charlie", age: 28, sex: "female", favColor: "aubergine"},
      {username: "Julian", age: 31, sex: "male", favColor: "chartreuse"}
    ]; // this will handle arbitrary data structures


  ------------------------------------------------------------------------------
  Property Name: displayColumns
  Status: REQUIRED
  Format: [Object Array]
  Description: columns the table will display
  Example:
    model.displayColumns = [
      {
        title: "User", // what gets displayed in the header
        objKey: username // key that is looked up on the object
      }
    ];

  ------------------------------------------------------------------------------
  Property Name: nestedKey
  Status: REQUIRED
  Format: [String]
  Description: key on each object containing the array you wish to visually nest
  Example:
    model.nestedKey = "users";
    // used as follows
    // var obj = objectList[i];
    // var nested = obj[model.nestedKey]; // "users"


  ------------------------------------------------------------------------------
  PropertyName: tableName
  Status: OPTIONAL
  Format: [String]
  Description: a name for the table
  Example:
    model.tableName = "My Table"; // defaults to "My Table Name";


  ------------------------------------------------------------------------------
  PropertyName: columnSizes
  Status: OPTIONAL (recommended)
  Format: [String Array]
  Description: html class applied to each column in the "table"
  Example:
    model.columnSizes = [
      "col-xs-2",
      "col-md-4 hidden-sm"
    ]; // uses array index to determine which column gets which size.


  ------------------------------------------------------------------------------
  PropertyName: sort
  Status: OPTIONAL (recommended)
  Format: [Object]
  Description:
    Uses Angular sort formatting.
    Link to documentation: (https://docs.angularjs.org/api/ng/filter/orderBy)
    This property will be applied on the template as
      {{ ...| orderBy:defaultSort.column:defaultSort.descending }}
  Example:
    model.defaultSort = { column: ["key1", "key2"], descending: [true, false] };
    // Default behavior is as follows.
    // model.defaultSort = {
    //   column: Object.keys(objectList[0][0]),
    //   descending: [false]
    // };


  ------------------------------------------------------------------------------
  PropertyName: rowClickAction
  Status: OPTIONAL
  Format: [Function]
  Description:
    This parameterized function accepts a row object (i.e., objectList[i]).
    This function is called whenever a user clicks a row.
    If on-click functionality is not desired, leave this property undefined.
  Example:
    model.rowClickAction = function (rowItem) {
      // Body of this fn does whatever I wanted to do with the rowItem
    }


  ------------------------------------------------------------------------------
  PropertyName: rowButtons
  Status: OPTIONAL
  Format: [Object Array]
  Description:
    This provides a means to append an arbitrary number of buttons to the end of
    a row.
  Example:
    model.rowButtons = [
      { title: "Edit",
        action: function (rowItem) {
          // Body of this fn does whatever I wanted to do with the rowItem
        }
      }
    ];


  ------------------------------------------------------------------------------
  PropertyName: headerButtons
  Status: OPTIONAL
  Format: [Object Array]
  Description:
    This provides a means to append an arbitrary number of buttons to the header
    row.
  Example:
    model.headerButtons = [
      { tile: "Create",
        action: function () {
          // Body of this fn does whatever I wanted to do from the headerRow
        }
      }
    ];


*/

angular.module('Orion.Directives')

.directive('supertable', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      model: '='
    },
    controller: 'STCtrl',
    templateUrl: '/app/views/superTable.html'
  };
}]);

/* -----------------------------------------------------------------------------
  MODEL FORMAT INFORMATION AND DOCUMENTATION
  ------------------------------------------------------------------------------


  ------------------------------------------------------------------------------
  PropertyName: objectList
  Status: REQUIRED
  Format: [Object Array]
  Description:
  Example:
  REQUIRED - [Object Array] - a data list of objects to show in the table
    model.objectList = [
      {username: "Charlie", age: 28, sex: "female", favColor: "aubergine"},
      {username: "Julian", age: 31, sex: "male", favColor: "chartreuse"}
    ]; // this will handle arbitrary data structures


  ------------------------------------------------------------------------------
  Property Name: displayColumns
  Status: REQUIRED
  Format: [Object Array]
  Description: columns the table will display
  Example:
    model.displayColumns = [
      {
        title: "User", // what gets displayed in the header
        objKey: username // key that is looked up on the object
      }
    ];


  ------------------------------------------------------------------------------
  PropertyName: tableName
  Status: OPTIONAL
  Format: [String]
  Description: a name for the table
  Example:
    model.tableName = "My Table"; // defaults to "My Table Name";


  ------------------------------------------------------------------------------
  PropertyName: sort
  Status: OPTIONAL (recommended)
  Format: [Object]
  Description:
    Uses Angular sort formatting.
    Link to documentation: (https://docs.angularjs.org/api/ng/filter/orderBy)
    This property will be applied on the template as
      {{ ...| orderBy:defaultSort.column:defaultSort.descending }}
  Example:
    model.defaultSort = { column: ["key1", "key2"], descending: [true, false] };
    // Default behavior is as follows.
    // model.defaultSort = {
    //   column: Object.keys(objectList[0][0]),
    //   descending: [false]
    // };


  ------------------------------------------------------------------------------
  PropertyName: rowClickAction
  Status: OPTIONAL
  Format: [Function]
  Description:
    This parameterized function accepts a row object (i.e., objectList[i]).
    This function is called whenever a user clicks a row.
    If on-click functionality is not desired, leave this property undefined.
  Example:
    model.rowClickAction = function (rowItem) {
      // Body of this fn does whatever I wanted to do with the rowItem
    }


  ------------------------------------------------------------------------------
  PropertyName: rowButtons
  Status: OPTIONAL
  Format: [Object Array]
  Description:
    This provides a means to append an arbitrary number of buttons to the end of
    a row.
  Example:
    model.rowButtons = [
      { title: "Edit",
        action: function (rowItem) {
          // Body of this fn does whatever I wanted to do with the rowItem
        }
      }
    ];


  ------------------------------------------------------------------------------
  PropertyName: headerButtons
  Status: OPTIONAL
  Format: [Object Array]
  Description:
    This provides a means to append an arbitrary number of buttons to the header
    row.
  Example:
    model.headerButtons = [
      { tile: "Create",
        action: function () {
          // Body of this fn does whatever I wanted to do from the headerRow
        }
      }
    ];


*/

/**
 * This service handles server side error responses for the whole app.
 * If a route has needsLogin: true, this will ensure the user is logged in.
 */

angular.module('Orion.Services')
.factory('Handler401', ['$q', '$cookies', '$window', '$injector', '$location',
function ($q, $cookies, $window, $injector, $location) {

  // Make them log in again.
  function logInAgain() {
    var url = $window.location.toString().split('#'),
        returnUrl = url[0],
        fragment = url[1];

    $location
    .search('returnUrl', returnUrl)
    .search('fragment', fragment)
    .path('/login');
  }

  // Pass an $http and $route.current.
  // Set the cookies if the user is logged in!
  function checkAuthorization(httpService, currentRoute) {
    var deferred = $q.defer();

    if ($cookies.userId !== null &&
        $cookies.userId !== undefined &&
        $cookies.userId !== 0 &&
        $cookies.userId !== "undefined") {
          deferred.resolve($cookies.userId);
    } else {

      httpService.get('/authorized').success(function (user) {
        if (user !== '0' && user !== undefined && user !== null && user !== "undefined") {
          $cookies.userId = user.id;
          $cookies.userName = user.firstName + " " + user.lastName;
          deferred.resolve($cookies.userId);
        } else {
          delete $cookies.userId;
          delete $cookies.user;
          deferred.reject("Unauthorized");
        }
      }).error(function (err) {
        delete $cookies.userId;
        delete $cookies.user;
        deferred.reject(err);
      });

    }

    return deferred.promise;

  }

  return {

    // Cool hax, bro.
    // Inject $http and $route to get around circular dependencies.
    // On each request, we want to check the user's cookie is set.
    request: function(config) {
      return $injector.invoke(function ($http, $route) {
        if ($route.current.needsLogin === true) {

          $route.current.needsLogin = false; //prevent infinite callback loop.

          checkAuthorization($http, $route.current)
          .then(function (resolveValue) {
            console.log("Resolve Value: ", resolveValue);
          }, function (rejectionReason) {
            console.log("Rejection Reason: ", rejectionReason);
            logInAgain();
          });
        }

        return config || $q.when(config);

      });
    },

    requestError: function(rejection) {
      logInAgain();
      return $q.reject(rejection);
    },

    response: function(response) {
      return response || $q.when(response);
    },

    // If the user is not logged in on the server side,
    // we're returning a 401 error code, so this will catch that.
    responseError: function(rejection) {
      if (rejection.status === 401) { logInAgain(); }
      return $q.reject(rejection);
    }
  };
}]);

angular.module('Orion.Services')
.factory('AlertService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

  var AlertService = {};
  // create an array of alerts available globally
  $rootScope.alerts = [];

  AlertService.add = function (type, message, timeout) {
    if(!timeout) { timeout = 5000; }
    if (timeout < 100) { timeout *= 1000; }
    var alert = {'type': type, 'message': message};
    $rootScope.alerts.push(alert);
    $timeout(function () {
      AlertService.closeAlert(alert);
    }, timeout);
  };

  AlertService.closeAlert = function (alert) {
    var indexOfAlert = $rootScope.alerts.indexOf(alert);
    AlertService.closeAlertIndex(indexOfAlert);
  };

  AlertService.closeAlertIndex = function (index) {
    $rootScope.alerts.splice(index, 1);
  };

  return AlertService;

}]);

angular.module('Orion.Services')
.factory('LoaderService', ['$rootScope', function ($rootScope) {

  var LoaderService = {};
  $rootScope.showLoader = false;

  LoaderService.show = function() {
    $rootScope.showLoader = true;
  };

  LoaderService.hide = function() {
    $rootScope.showLoader = false;
  };

  return LoaderService;

}]);

angular.module('Orion.Services')
.factory('RedirectService', ['$location', function ($location) {

  var RedirectService = {};

  RedirectService.getEditRedirectFn = function (model) {
    return function (obj) {
      var id = obj ? obj.id : undefined;
      $location.path("/" + model + "/edit/" + (id || ""));
    }
  };

  RedirectService.getIndexRedirectFn = function (model) {
    return function () { $location.path("/" + model); }
  };

  return RedirectService;

}]);

/**
 * These are resources. By default, a resource has these methods:
 * get({id: X}) GET -> /api/objects/X
 * save({}, newInfo) POST -> /api/objects/
 * save({id: X}, newInfo) POST (obj.$save()) -> /api/objects/X
 * query() get -> /api/objects
 * remove({id: X}) POST -> /api/objects/X
 * delete({id: X}) POST -> /api/objects/X
 */

angular.module('Orion.Services')

.factory('Areas', ['$resource', function ($resource) {
  return $resource('/api/areas/:id', {id: '@id'});
}])

.factory('Compressors', ['$resource', function ($resource) {
  return $resource('/api/compressors/:id', {id: '@id'});
}])

.factory('Counties', ['$resource', function ($resource) {
  return $resource('/api/counties/:id', {id: '@id'});
}])

.factory('Customers', ['$resource', function ($resource) {
  return $resource('/api/customers/:id', {id: '@id'});
}])

.factory('Engines', ['$resource', function ($resource) {
  return $resource('/api/engines/:id', {id: '@id'});
}])

.factory('Locations', ['$resource', function ($resource) {
  return $resource('/api/locations/:id', {id: '@id'});
}])

.factory('Parts', ['$resource', function ($resource) {
  return $resource('/api/parts/:id', {id: '@id'});
}])

.factory('States', ['$resource', function ($resource) {
  return $resource('/api/states/:id', {id: '@id'});
}])

.factory('Units', ['$resource', function ($resource) {
  return $resource('/api/units/:id', {id: '@id'});
}])

.factory('Users', ['$resource', function ($resource) {
  return $resource('/api/users/:id', {id: '@id'});
}])

.factory('Vendors', ['$resource', function ($resource) {
  return $resource('/api/vendors/:id', {id: '@id'});
}])

.factory('WorkOrders', ['$resource', function ($resource) {
  return $resource('/api/workorders/:id', {id: '@id'});
}]);

angular.module('Orion.Services')
.factory('GeographyService', ['$rootScope', function ($rootScope) {

  var GeographyService = {};

  GeographyService.states = [
    "Arkansas","Colorado", "Louisiana", "New Mexico", "Oklahoma", "Texas"
  ];

  GeographyService.counties = function (state) {
    var counties = [];
    switch (state) {
      case "Arkansas":
        counties = [
          "Arkansas", "Ashley", "Baxter", "Benton", "Boone", "Bradley", "Calhoun",
          "Carroll", "Chicot", "Clark", "Clay", "Cleburne", "Cleveland", "Columbia",
          "Conway", "Craighead", "Crawford", "Crittenden", "Cross", "Dallas", "Desha",
          "Drew", "Faulkner", "Franklin", "Fulton", "Garland", "Grant", "Greene",
          "Hempstead", "Hot Spring", "Howard", "Independence", "Izard", "Jackson",
          "Jefferson", "Johnson", "Lafayette", "Lawrence", "Lee", "Lincoln",
          "Little River", "Logan", "Lonoke", "Madison", "Marion", "Miller",
          "Mississippi", "Monroe", "Montgomery", "Nevada", "Newton", "Ouachita",
          "Perry", "Phillips", "Pike", "Poinsett", "Polk", "Pope", "Prairie",
          "Pulaski", "Randolph", "St. Francis", "Saline", "Scott", "Searcy",
          "Sebastian", "Sevier", "Sharp", "Stone", "Union", "Van Buren",
          "Washington", "White", "Woodruff", "Yell"
        ];
        break;

      case "Colorado":
        counties = [
          "Adams", "Alamosa", "Arapahoe", "Archuleta", "Baca", "Bent",
          "Boulder", "Broomfield", "Chaffee", "Cheyenne", "Clear", "Conejos",
          "Costilla", "Crowley", "Custer", "Delta", "Denver", "Dolores",
          "Douglas", "Eagle", "Elbert", "El Paso", "Fremont", "Garfield",
          "Gilpin", "Grand", "Gunnison", "Hinsdale", "Huerfano", "Jackson",
          "Jefferson", "Kiowa", "Kit Carson", "Lake", "La Plata", "Larimer",
          "Las Animas", "Lincoln", "Logan", "Mesa", "Mineral", "Moffat",
          "Montezuma", "Montrose", "Morgan", "Otero", "Ouray", "Park",
          "Phillips", "Pitkin", "Prowers", "Pueblo", "Rio Blanco", "Rio Grande",
          "Routt", "Saguache", "San Juan", "San Miguel", "Sedgwick", "Summit",
          "Teller", "Washington", "Weld", "Yuma"
        ];
        break;

      case "Louisiana":
        counties = [
          "Acadia", "Allen", "Ascension", "Assumption", "Avoyelles",
          "Beauregard", "Bienville", "Bossier", "Caddo", "Calcasieu",
          "Caldwell", "Cameron", "Catahoula", "Claiborne", "Concordia",
          "De Soto", "East Baton Rouge", "East Carroll", "East Feliciana",
          "Evangeline", "Franklin", "Grant", "Iberia", "Iberville", "Jackson",
          "Jefferson", "Jefferson Davis", "Lafayette", "Lafourche", "La Salle",
          "Lincoln", "Livingston", "Madison", "Morehouse", "Natchitoches",
          "Orleans", "Ouachita", "Plaquemines", "Pointe Coupee", "Rapides",
          "Red River", "Richland", "Sabine", "St. Bernard", "St. Charles",
          "St. Helena", "St. James", "St. John the Baptist", "St. Landry",
          "St. Martin", "St. Mary", "St. Tammany", "Tangipahoa", "Tensas",
          "Terrebonne", "Union", "Vermilion", "Vernon", "Washington", "Webster",
          "West Baton Rouge", "West Carroll", "West Feliciana", "Winn"
         ];
         break;

       case "New Mexico":
         counties = [
           "Bernalillo", "Catron ", "Chaves ", "Cibola ",
           "Colfax ", "Curry ", "De Baca", "Dona Ana",
           "Eddy ", "Grant ", "Guadalupe ", "Harding ",
           "Hidalgo ", "Lea ", "Lincoln ", "Los Alamos",
           "Luna ", "McKinley ", "Mora ", "Otero ",
           "Quay ", "Rio Arriba", "Roosevelt ", "Sandoval ",
           "San Juan", "San Migeul", "Sante Fe", "Sierra", "Socorro", "Taos",
           "Torrance", "Union", "Valencia"
         ];
         break;

       case "Oklahoma":
         counties = [
           "Adair", "Alfalfa", "Atoka", "Beaver", "Beckham", "Blaine", "Bryan", "Caddo",
           "Canadian", "Carter", "Cherokee", "Choctaw", "Cimarron", "Cleveland",
           "Coal", "Comanche", "Cotton", "Craig", "Creek", "Custer", "Delaware",
           "Dewey", "Ellis", "Garfield", "Garvin", "Grady", "Grant", "Greer",
           "Harmon", "Harper", "Haskell", "Hughes", "Jackson", "Jefferson",
           "Johnston", "Kay", "Kingfisher", "Kiowa", "Latimer", "Le Flore",
           "Lincoln", "Logan", "Love", "Major", "Marshall", "Mayes", "McClain",
           "McCurtain", "McIntosh", "Murray", "Muskogee", "Noble", "Nowata",
           "Okfuskee", "Oklahoma", "Okmulgee", "Osage", "Ottawa", "Pawnee",
           "Payne", "Pittsburg", "Pontotoc", "Pottawatomie", "Pushmataha",
           "Roger Mills", "Rogers", "Seminole", "Sequoyah", "Stephens", "Texas",
           "Tillman", "Tulsa", "Wagoner", "Washington", "Washita", "Woods",
           "Woodward"
         ];
         break;

      case "Texas":
        counties = [
          "Anderson", "Andrews", "Angelina", "Aransas",
          "Archer", "Armstrong", "Atascosa", "Austin",
          "Bailey", "Bandera", "Bastrop", "Baylor",
          "Bee", "Bell", "Bexar", "Blanco", "Borden",
          "Bosque", "Bowie", "Brazoria", "Brazos", "Brewster",
          "Briscoe", "Brooks", "Brown", "Burleson", "Burnet",
          "Caldwell", "Calhoun", "Callahan", "Cameron", "Camp",
          "Carson", "Cass", "Castro", "Chambers", "Cherokee",
          "Childress", "Clay", "Cochran", "Coke", "Coleman",
          "Collin", "Collingsworth", "Colorado", "Comal", "Comanche",
          "Concho", "Cooke", "Coryell", "Cottle", "Crane", "Crockett",
          "Crosby", "Culberson", "Dallam", "Dallas", "Dawson", "Deaf Smith",
          "Delta", "Denton", "DeWitt", "Dickens", "Dimmit", "Donley",
          "Duval", "Eastland", "Ector", "Edwards", "Ellis", "El Paso",
          "Erath", "Falls", "Fannin", "Fayette", "Fisher", "Floyd",
          "Foard", "Fort Bend", "Franklin", "Freestone", "Frio", "Gaines",
          "Galveston", "Garza", "Gillespie", "Glasscock", "Goliad", "Gonzales",
          "Gray", "Grayson", "Gregg", "Grimes", "Guadalupe", "Hale", "Hall",
          "Hamilton", "Hansford", "Hardeman", "Hardin", "Harris", "Harrison",
          "Hartley", "Haskell", "Hays", "Hemphill", "Henderson", "Hidalgo",
          "Hill", "Hockley", "Hood", "Hopkins", "Houston", "Howard",
          "Hudspeth", "Hunt", "Hutchinson", "Irion", "Jack", "Jackson",
          "Jasper", "Jeff Davis", "Jefferson", "Jim Hogg", "Jim Wells", "Johnson",
          "Jones", "Karnes", "Kaufman", "Kendall", "Kenedy", "Kent", "Kerr",
          "Kimble", "King", "Kinney", "Kleberg", "Knox", "Lamar", "Lamb",
          "Lampasas", "La Salle", "Lavaca", "Lee", "Leon", "Liberty",
          "Limestone", "Lipscomb", "Live Oak", "Llano", "Loving", "Lubbock",
          "Lynn", "McCulloch", "McLennan", "McMullen", "Madison", "Marion",
          "Martin", "Mason", "Matagorda", "Maverick", "Medina", "Menard",
          "Midland", "Milam", "Mills", "Mitchell", "Montague", "Montgomery",
          "Moore", "Morris", "Motley", "Nacogdoches", "Navarro", "Newton",
          "Nolan", "Nueces", "Ochiltree", "Oldham", "Orange", "Palo Pinto",
          "Panola", "Parker", "Parmer", "Pecos", "Polk", "Potter", "Presidio",
          "Rains", "Randall", "Reagan", "Real", "Red River", "Reeves",
          "Refugio", "Roberts", "Robertson", "Rockwall", "Runnels", "Rusk",
          "Sabine", "San Augustine", "San Jacinto", "San Patricio", "San Saba",
          "Schleicher", "Scurry", "Shackelford", "Shelby", "Sherman", "Smith",
          "Somervell", "Starr", "Stephens", "Sterling", "Stonewall", "Sutton",
          "Swisher", "Tarrant", "Taylor", "Terrell", "Terry", "Throckmorton",
          "Titus", "Tom Green", "Travis", "Trinity", "Tyler", "Upshur",
          "Upton", "Uvalde", "Val Verde", "Van Zandt", "Victoria", "Walker",
          "Waller", "Ward", "Washington", "Webb", "Wharton", "Wheeler", "Wichita",
          "Wilbarger", "Willacy", "Williamson", "Wilson", "Winkler", "Wise",
          "Wood", "Yoakum", "Young", "Zapata", "Zavala"
        ];
        break;
      }
    return counties;
  };

  return GeographyService;

}]);

angular.module('Orion.Services')
.factory('role', ['$q', '$http', function ($q, $http) {

  var role = {};

  role.get = function () {
    var deferred = $q.defer();

    var url = '/api/role';

    $http.get(url)
    .success(function (response) {
      deferred.resolve(response);
    })
    .error(function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  return role;

}]);

angular.module('CustomerApp.Controllers', []);
angular.module('CustomerApp.Directives', []);
angular.module('CustomerApp.Services', ['ngResource', 'ngCookies']);

angular.module('CustomerApp', [
  'CustomerApp.Controllers',
  'CustomerApp.Directives',
  'CustomerApp.Services',
]);


angular.module('CustomerApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/customer/edit/:id?', {
    controller: 'CustomerEditCtrl',
    templateUrl: '/app/apps/customer/views/edit.html',
    resolve: {
      customer: function($route, $q, Customers) {
        //determine if we're creating or editing a customer.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Customers.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      locations: function($route, $q, Locations) {
        //determine if we're creating or editing a customer.
        //if editing show the locations; otherwise, nothing.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Locations.query({where: {CustomerId: id}},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/customer', {
    controller: 'CustomerIndexCtrl',
    templateUrl: '/app/apps/customer/views/index.html',
    resolve: {
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('LocationApp.Controllers', []);
angular.module('LocationApp.Directives', []);
angular.module('LocationApp.Services', ['ngResource', 'ngCookies']);

angular.module('LocationApp', [
  'LocationApp.Controllers',
  'LocationApp.Directives',
  'LocationApp.Services',
]);


angular.module('LocationApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/location/edit/:id?', {
    controller: 'LocationEditCtrl',
    templateUrl: '/app/apps/location/views/edit.html',
    resolve: {
      location: function($route, $q, Locations) {
        //determine if we're creating or editing a location.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Locations.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      servicePartners: function($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  })

  .when('/location', {
    controller: 'LocationIndexCtrl',
    templateUrl: '/app/apps/location/views/index.html',
    resolve: {
      locations: function($route, $q, Locations) {
        var deffered = $q.defer();
        Locations.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('PartApp.Controllers', []);
angular.module('PartApp.Directives', []);
angular.module('PartApp.Services', ['ngResource', 'ngCookies']);

angular.module('PartApp', [
  'PartApp.Controllers',
  'PartApp.Directives',
  'PartApp.Services',
]);


angular.module('PartApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/part/edit/:id?', {
    controller: 'PartEditCtrl',
    templateUrl: '/app/apps/part/views/edit.html',
    resolve: {
      part: function($route, $q, Parts) {
        //determine if we're creating or editing a part.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Parts.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      vendors: function ($route, $q, Vendors) {
        var deffered = $q.defer();
        Vendors.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/part', {
    controller: 'PartIndexCtrl',
    templateUrl: '/app/apps/part/views/index.html',
    resolve: {
      parts: function($route, $q, Parts) {
        var deffered = $q.defer();
        Parts.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  });
}]);

angular.module('ServicePartnerApp.Controllers', []);
angular.module('ServicePartnerApp.Directives', []);
angular.module('ServicePartnerApp.Services', ['ngResource', 'ngCookies']);

angular.module('ServicePartnerApp', [
  'ServicePartnerApp.Controllers',
  'ServicePartnerApp.Directives',
  'ServicePartnerApp.Services',
]);


angular.module('ServicePartnerApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/servicepartner/edit/:id?', {
    controller: 'ServicePartnerEditCtrl',
    templateUrl: '/app/apps/servicepartner/views/edit.html',
    resolve: {
      servicePartner: function($route, $q, ServicePartners) {
        //determine if we're creating or editing a servicePartner.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          ServicePartners.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/servicepartner', {
    controller: 'ServicePartnerIndexCtrl',
    templateUrl: '/app/apps/servicepartner/views/index.html',
    resolve: {
      servicePartners: function($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('TransferApp.Controllers', []);
angular.module('TransferApp.Directives', []);
angular.module('TransferApp.Services', ['ngResource', 'ngCookies']);

angular.module('TransferApp', [
  'TransferApp.Controllers',
  'TransferApp.Directives',
  'TransferApp.Services',
]);


angular.module('TransferApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/transfer/edit/:id?', {
    needsLogin: true,
    controller: 'TransferEditCtrl',
    templateUrl: '/app/apps/transfer/views/edit.html',
    resolve: {
      transfer: function($route, $q, Transfers) {
        //determine if we're creating or editing a transfer.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Transfers.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      units: function($route, $q, Units) {
        var deffered = $q.defer();
        Units.query({},
          function (response) {return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      users: function($route, $q, Users) {
        var deffered = $q.defer();
        Users.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      parts: function($route, $q, Parts) {
        var deffered = $q.defer();
        Parts.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      servicePartners: function($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/transfer', {
    needsLogin: true,
    controller: 'TransferIndexCtrl',
    templateUrl: '/app/apps/transfer/views/index.html',
    resolve: {
      transfers: function($route, $q, Transfers) {
        var deffered = $q.defer();
        Transfers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('UserApp.Controllers', []);
angular.module('UserApp.Directives', []);
angular.module('UserApp.Services', ['ngResource', 'ngCookies']);

angular.module('UserApp', [
  'UserApp.Controllers',
  'UserApp.Directives',
  'UserApp.Services',
]);


angular.module('UserApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/user/edit/:id?', {
    controller: 'UserEditCtrl',
    templateUrl: '/app/apps/user/views/edit.html',
    resolve: {
      user: function($route, $q, Users) {
        //determine if we're creating or editing a user.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Users.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      servicePartners: function ($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/user', {
    controller: 'SuperIndexCtrl',
    templateUrl: '/app/views/superIndex.html',
    resolve: {
      // Required Attributes for SuperIndex
      title: function () { return "Users"; },
      model: function () { return "user"; },
      objectList: function ($route, $q, Users) {
        var deffered = $q.defer();
        var select = ['id', 'firstName', 'lastName', 'email'];
        Users.query({attributes: select},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      displayColumns: function () {
        return [
          { title: "First Name", objKey: 'firstName' },
          { title: "Last Name", objKey: 'lastName' },
          { title: "Email", objKey: 'email' }
        ];
      },
      //not required
      sort: function () {
        return { column: ["firstName"], descending: [false] };
      },
      rowClickAction: function () { return; }, // default behavior
      rowButtons: function () { return; }, // default behavior
      headerButtons: function () { return; } // default behavior
    }
  });
}]);

angular.module('UnitApp.Controllers', []);
angular.module('UnitApp.Directives', []);
angular.module('UnitApp.Services', ['ngResource', 'ngCookies']);

angular.module('UnitApp', [
  'UnitApp.Controllers',
  'UnitApp.Directives',
  'UnitApp.Services',
]);


angular.module('UnitApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/unit/edit/:id?', {
    controller: 'UnitEditCtrl',
    templateUrl: '/app/apps/unit/views/edit.html',
    resolve: {
      unit: function($route, $q, Units) {
        //determine if we're creating or editing a unit.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Units.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      servicePartners: function($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  })

  .when('/unit', {
    controller: 'UnitIndexCtrl',
    templateUrl: '/app/apps/unit/views/index.html',
    resolve: {
      units: function($route, $q, Units) {
        var deffered = $q.defer();
        Units.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  });
}]);

angular.module('VendorApp.Controllers', []);
angular.module('VendorApp.Directives', []);
angular.module('VendorApp.Services', ['ngResource', 'ngCookies']);

angular.module('VendorApp', [
  'VendorApp.Controllers',
  'VendorApp.Directives',
  'VendorApp.Services',
]);


angular.module('VendorApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/vendor/edit/:id?', {
    controller: 'VendorEditCtrl',
    templateUrl: '/app/apps/vendor/views/edit.html',
    resolve: {
      vendor: function($route, $q, Vendors) {
        //determine if we're creating or editing a vendor.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Vendors.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      vendorFamilies: function($route, $q, VendorFamilies) {
        var deffered = $q.defer();
        VendorFamilies.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/vendor', {
    controller: 'VendorIndexCtrl',
    templateUrl: '/app/apps/vendor/views/index.html',
    resolve: {
      vendors: function($route, $q, Vendors) {
        var deffered = $q.defer();
        Vendors.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('VendorPartApp.Controllers', []);
angular.module('VendorPartApp.Directives', []);
angular.module('VendorPartApp.Services', ['ngResource', 'ngCookies']);

angular.module('VendorPartApp', [
  'VendorPartApp.Controllers',
  'VendorPartApp.Directives',
  'VendorPartApp.Services',
]);


angular.module('VendorPartApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/vendorpart/edit/:id?', {
    controller: 'VendorPartEditCtrl',
    templateUrl: '/app/apps/vendorpart/views/edit.html',
    resolve: {
      vendorpart: function($route, $q, VendorParts) {
        //determine if we're creating or editing a vendorpart.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          VendorParts.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      parts: function($route, $q, Parts) {
        var deffered = $q.defer();
        Parts.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      vendors: function($route, $q, Vendors) {
        var deffered = $q.defer();
        Vendors.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/vendorpart', {
    controller: 'VendorPartIndexCtrl',
    templateUrl: '/app/apps/vendorpart/views/index.html',
    resolve: {
      vendorparts: function($route, $q, VendorParts) {
        var deffered = $q.defer();
        VendorParts.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('WorkOrderApp.Controllers', []);
angular.module('WorkOrderApp.Directives', []);
angular.module('WorkOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('WorkOrderApp', [
  'WorkOrderApp.Controllers',
  'WorkOrderApp.Directives',
  'WorkOrderApp.Services'
]);


angular.module('WorkOrderApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/workorder/edit/:id?', {
    needsLogin: true,
    controller: 'WorkOrderEditCtrl',
    templateUrl: '/app/apps/workorder/views/edit.html',
    resolve: {
      workorder: function($route, $q, WorkOrders) {
        //determine if we're creating or editing a workorder.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          WorkOrders.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      units: function($route, $q, Units) {
        var deffered = $q.defer();
        Units.query({},
          function (response) {return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      users: function($route, $q, Users) {
        var deffered = $q.defer();
        Users.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      parts: function($route, $q, Parts) {
        var deffered = $q.defer();
        Parts.query({},
          function (response) {
            response.push({
              id: null,
              vendorPartNumber: "Other",
              concatenateName: "Other"
            });
            return deffered.resolve(response);
          },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/workorder', {
    needsLogin: true,
    controller: 'WorkOrderIndexCtrl',
    templateUrl: '/app/apps/workorder/views/index.html',
    resolve: {
      workorders: function($route, $q, WorkOrders) {
        var deffered = $q.defer();
        WorkOrders.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('CustomerApp.Controllers').controller('CustomerEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Customers', 'customer', 'locations',
  function ($scope, $route, $location, AlertService, LoaderService, Customers, customer, locations) {

    $scope.title = customer ? "Edit " + customer.dbaCustomerName :
                              "Create a new customer";

    $scope.customer = customer;
    $scope.locations = locations;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.customer.id) {
        // Edit an existing customer.
        Customers.save({id: customer.id}, $scope.customer,
          function (response) {
            $location.path("/customer");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new customer.
        Customers.save({}, $scope.customer,
          function (response) {
            $location.path("/customer");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Customers.delete({id: customer.id},
        function (response) {
          $location.path("/customer");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('CustomerApp.Controllers').controller('CustomerIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'customers',
  function ($scope, $route, $location, AlertService, LoaderService, customers) {

    $scope.title = "Customers";

    $scope.customers = customers;

    $scope.editCustomer = function (id) {
      $location.path("/customer/edit/" + (id || ""));
    };

    $scope.createCustomer = function () {
      $scope.editCustomer();
    };

    $scope.sort = {
      column: "dbaCustomerName",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);

angular.module('LocationApp.Controllers').controller('LocationEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Locations', 'location', 'customers', 'servicePartners', 'GeographyService',
  function ($scope, $route, $location, AlertService, LoaderService, Locations, location, customers, servicePartners, GeographyService) {

    $scope.title = location ? "Edit " + location.name : "Create a new location";

    $scope.location = location;
    $scope.customers = customers;
    $scope.servicePartners = servicePartners;
    $scope.states = GeographyService.states;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.location.id) {
        // Edit an existing location.
        Locations.save({id: location.id}, $scope.location,
          function (response) {
            $location.path("/location");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new location.
        Locations.save({}, $scope.location,
          function (response) {
            $location.path("/location");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Locations.delete({id: location.id},
        function (response) {
          $location.path("/location");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    $scope.$watch('location.state', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.location.county = null;
        $scope.counties = GeographyService.counties(newVal);
      }
    }, true);

    (function () {
      if (!$scope.location || !$scope.location.state) {
        return;
      } else {
        $scope.counties = GeographyService.counties($scope.location.state);
        if ($scope.counties.indexOf($scope.location.county) == -1) {
          var message = "Please enter a valid county for this location.";
          AlertService.add("warning", message);
        }
      }
    })();

}]);

angular.module('LocationApp.Controllers').controller('LocationIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'locations',
  function ($scope, $route, $location, AlertService, LoaderService, locations) {

    $scope.title = "Locations";

    $scope.locations = locations;

    $scope.editLocation = function (id) {
      $location.path("/location/edit/" + (id || ""));
    };

    $scope.createLocation = function () {
      $scope.editLocation();
    };

    $scope.sort = {
      column: "name",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);

angular.module('TransferApp.Directives')

.directive('locationList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/location/views/list.html',
    link: function (scope, elem, attrs, ctrl, $location) {

    }
  };
}]);

angular.module('PartApp.Controllers').controller('PartEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Parts', 'part', 'vendors', 'enumeration', '$window', 'VendorParts',
  function ($scope, $route, $location, AlertService, LoaderService, Parts, part, vendors, enumeration, $window, VendorParts) {

    $scope.title = part ? "Edit " + part.smartPartNumber : "Create a new part";
    $scope.vendors = vendors;

    if (part) {
      $scope.part = part;
      $scope.part.revision = $scope.part.revision + 1;
    } else {
      $scope.part = emptyPart();
    }

    $scope.enumeration = enumeration.part;
    $scope.systems = $scope.enumeration.systemNames();
    $scope.engines = $scope.enumeration.engineNames();
    $scope.compressors = $scope.enumeration.compressorNames();

    $window.scope = $scope;

    function emptyPart () {
      $scope.disallowSave = true;
      return {
        vendorPartNumber: "",
        description: "",
        quantity: 0,
        cost: 0,
        system: 0,
        subsystem: 0,
        component: 0,
        revision: 0,
        vendorParts: []
      };
    }

    $scope.$watch('part', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.part.smartPartNumber = $scope.enumeration.smartPartNumber($scope.part);
        if (!newVal.description || newVal.system <= 0 || newVal.subsystem <= 0) {
          $scope.disallowSave = true;
        } else {
          $scope.disallowSave = false;
        }
      }
    }, true);

    $scope.$watch('part.system', function (newVal, oldVal) {
      $scope.subsystemsLoading = true;
      $scope.subsystems = $scope.enumeration.subsystemNames($scope.part);
      $scope.subsystemsLoading = false;
    }, true);

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.part.id) {
        // Edit an existing part.
        Parts.save({id: part.id}, $scope.part,
          function (response) {
            $location.path("/part");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new part.
        Parts.save({}, $scope.part,
          function (response) {
            if ($scope.part.unsavedVendorParts && $scope.part.unsavedVendorParts.length > 0) {
              $scope.part.id = response.id;
              console.log("part.id: ", $scope.part.id);
              console.log("unsavedVendorParts: ", $scope.part.unsavedVendorParts);
              $scope.saveMultipleVendorParts($scope.part.unsavedVendorParts,
                function (err) {
                  if (err) { AlertService.add("error", err); }
                  else {
                    AlertService.add("success", "Vendors successfully saved.");
                    //$location.path("/part");
                    $scope.submitting = false;
                  }
                });
            } else {
              $location.path("/part");
              $scope.submitting = false;
            }
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Parts.delete({id: part.id},
        function (response) {
          $location.path("/part");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    $scope.saveMultipleVendorParts = function (vendorParts, callback) {
      if (vendorParts && vendorParts.length > 0) {
        // save one and recursively call self.
        var vp = vendorParts.pop();
        vp.PartId = $scope.part.id;
        console.log("vp: ", vp);
        VendorParts.save({}, vp,
          function (response) {
            console.log("response: ", response);
            AlertService.add("success", "That vendor was successfully added.");
            $scope.saveMultipleVendorParts(vendorParts, callback);
          },
          function (err) {
            return callback(err);
          }
        );
      } else {
        return callback(null);
      }
    };

}]);

angular.module('PartApp.Controllers').controller('PartIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'parts', 'role', 'ArrayFilterService',
  function ($scope, $route, $location, AlertService, LoaderService, parts, role, ArrayFilterService) {

    $scope.title = "Parts";

    $scope.parts = parts;
    $scope.role = role;

    $scope.editPart = function (id) {
      $location.path("/part/edit/" + (id || ""));
    };

    $scope.createPart = function () {
      $scope.editPart();
    };

    $scope.sort = {
      column: "smartPartNumber",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.searchParts = function (searchPhrase) {
      if(searchPhrase === ""){
        $scope.workorders = parts;
      }
      else{
        ArrayFilterService.filter(parts, searchPhrase, function (err, results) {
          $scope.parts = results;
        });
      }
    };

    /* *************************************************************************
    Table sort and search functionality (TODO: make this a service)
    ************************************************************************* */
    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Number",      objKey: "smartPartNumber" },
        { title: "System",      objKey: "systemName" },
        { title: "Subsystem",   objKey: "subsystemConcatenateName" },
        { title: "Description", objKey: "description" },
      ];
    }

    function getTableColumnSizes () {
      return [ // what size do you want the columns to be (html)
        "col-xs-2", // number
        "col-xs-2", // system
        "col-xs-2", // subsystem
        "col-xs-4 hidden-md hidden-sm hidden-xs", // description (don't show on mobile)
        "col-xs-2", // button
      ];
    }

    function getTableSort () {
      return {
        column: ["smartPartNumber"],
        descending: [false]
      };
    }

    var tableRowAction = function (obj) {
      $scope.editPart(obj.id);
    };

    var tableHeaderAction = function (obj) {
      $scope.createPart();
    };

    function getTableRowButtons () {
      var arr = [];

      var button = {};
      button.title = "edit";
      button.action = tableRowAction;

      arr.push(button);

      return arr;
    }

    function getTableHeaderButtons() {
      var arr = [];

      var button = {};
      button.title = "new part";
      button.action = tableHeaderAction;

      arr.push(button);
      return arr;
    }

    function getNestedDisplayColumns() {
      return [ // which columns need to be displayed in the table
        { title: "Vendor",      objKey: "vendor.name" },
        { title: "Part #",      objKey: "vendorPartNumber" },
        { title: "Description", objKey: "vendorPartDescription" },
        { title: "Cost",        objKey: "vendorPartCost" },
      ];
    }

    $scope.tableModel = {
      tableName: "Parts", // displayed at top of page
      objectList: $scope.parts, // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
      columnSizes: getTableColumnSizes(),
      sort: getTableSort(),
      //rowClickAction: tableRowAction,
      rowButtons: getTableRowButtons(),
      headerButtons: getTableHeaderButtons(),

      nestedTableName: "Vendor Parts",
      nestedKey: "vendorParts",
      nestedDisplayColumns: getNestedDisplayColumns(),

    };

}]);

angular.module('PartApp.Directives')

.directive('vendorParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/part/views/vendorparts.html',
    scope: true,
    controller: 'PartsVendorPartsCtrl'
  };
}]);

angular.module('ServicePartnerApp.Controllers').controller('ServicePartnerEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'ServicePartners', 'servicePartner',
  function ($scope, $route, $location, AlertService, LoaderService, ServicePartners, servicePartner) {

    $scope.title = servicePartner ? "Edit " + servicePartner.name :
                                    "Create a new service partner";

    $scope.servicePartner = servicePartner;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.servicePartner.id) {
        // Edit an existing servicePartner.
        ServicePartners.save({id: servicePartner.id}, $scope.servicePartner,
          function (response) {
            $location.path("/servicepartner");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new servicePartner.
        ServicePartners.save({}, $scope.servicePartner,
          function (response) {
            $location.path("/servicepartner");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      ServicePartners.delete({id: servicePartner.id},
        function (response) {
          $location.path("/servicepartner");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('ServicePartnerApp.Controllers').controller('ServicePartnerIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'servicePartners',
  function ($scope, $route, $location, AlertService, LoaderService, servicePartners) {

    $scope.title = "Service Partners";

    $scope.servicePartners = servicePartners;

    $scope.editServicePartner = function (id) {
      $location.path("/servicepartner/edit/" + (id || ""));
    };

    $scope.createServicePartner = function () {
      $scope.editServicePartner();
    };

    $scope.sort = {
      column: "name",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);

angular.module('TransferApp.Controllers').controller('TransferEditCtrl',
['$scope', '$window', '$location', '$timeout', 'AlertService', 'transfer', 'units', 'customers', 'users', 'parts', 'role', 'servicePartners', 'TransferEditService', 'TransferAccordionService', 'GeographyService',
  function ($scope, $window, $location, $timeout, AlertService, transfer, units, customers, users, parts, role, servicePartners, TransferEditService, TransferAccordionService, GeographyService) {

    $scope.title = (transfer !== null ? "Edit " : "Create ") + "Transfer";
    $scope.loadingData = true;
    $scope.states = GeographyService.states;

    TransferEditService.load(transfer, function (err) {
      if (err) {
        AlertService.add("danger", err);
      } else {

        $scope.transfer = TransferEditService.transfer;
        $scope.locations = TransferEditService.locations;
        $scope.technicians = TransferEditService.technicians;

        // Setup the button text.
        $scope.submitButtonText =
          TransferEditService.submitButtonText($scope.transfer);
        $scope.rejectButtonText =
          TransferEditService.rejectButtonText($scope.transfer);

        // Set up the accordion.
        $scope.accordion = TransferAccordionService.instantiate($scope.transfer);
        $scope.oneAtATime = !$scope.transfer.id;
        $timeout(function () { $scope.loadingData = false; }, 1000);
      }
    });

    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.role = role;
    $scope.servicePartners = servicePartners;
    $window.scope = $scope;

    $scope.toggleAll = function () {
      $scope.oneAtATime = !$scope.oneAtATime;
      if ($scope.oneAtATime) {
        $scope.accordion.genInfo.open = false;
        $scope.accordion.transfer.open = false;
      } else {
        $scope.accordion.genInfo.open = true;
        $scope.accordion.transfer.open = true;
      }
    };


    $scope.save = function () {
      $scope.submitting = true;
      TransferEditService.save($scope.transfer, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success",  $scope.submitButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/transfer");
        }
      });
    };


    $scope.destroy = function () {
      $scope.submitting = true;
      TransferEditService.destroy($scope.transfer, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success", $scope.rejectButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/transfer");
        }
      });
    };

    $scope.filterTitleCase = function (input) {
      if (!input) { return; }
      var words = input.split(' ');
      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase(); // lowercase everything to get rid of weird casing issues
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
      }
      return words.join(' ');
    };

}]);

angular.module('TransferApp.Controllers').controller('TransferIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'transfers', 'ArrayFilterService',
  function ($scope, $route, $location, AlertService, LoaderService, transfers, ArrayFilterService) {

    $scope.title = "Transfers";

    $scope.transfers = transfers;

    $scope.editTransfer = function (id) {
      $location.path("/transfer/edit/" + (id || ""));
    };

    $scope.createTransfer = function () {
      $scope.editTransfer();
    };

    $scope.sort = {
      column: ["status", "date", "number"],
      descending: [true],
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.searchTransfers = function (searchPhrase) {
      if(!searchPhrase || searchPhrase === ""){
        $scope.transfers = transfers;
      } else {
        ArrayFilterService.filter(transfers, searchPhrase, function (err, results) {
          $scope.transfers = results;
        });
      }
    };

}]);

angular.module('TransferApp.Directives')

.directive('transferCustomer', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferCustomer.html',
    scope: true,
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferDetails', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferDetails.html',
    scope: true,
    controller: 'TransferDetailsCtrl'
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferInformation', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferInformation.html',
    scope: true,
    controller: 'TransferInformationCtrl'
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferLocationCreate', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferLocationCreate.html',
    scope: true,
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferNewset', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferNewset.html',
    scope: true,
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferReassignment', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferReassignment.html',
    scope: true,
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferSimple', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferSimple.html',
    scope: true,
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferSwap', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferSwap.html',
    scope: true,
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferYard', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferYard.html',
    scope: true,
  };
}]);

angular.module('TransferApp.Services')
.factory('TransferAccordionService', ['Transfers', function (Transfers) {

  var TransferAccordionService = {};

  TransferAccordionService.instantiate = function (transfer) {
    var isCreate = !transfer.id;
    return {
      genInfo:    { open: true,      disabled: false, valid: false },
      transfer:   { open: !isCreate, disabled: true,  valid: false },
      parts:      { open: !isCreate, disabled: true,  valid: false }
    };
  };

  TransferAccordionService.sectionIsValid = function (section, accordion, transfer) {

    var tran = transfer;
    var isValid = false;

    switch (section) {

      case "genInfo":
        if ((tran.transferType === "REASSIGNMENT") ||
            (tran.date && tran.unit.number && tran.transferType)) {
          isValid = true;
        }
        break;


      case "transfer":

        isValid = accordion.genInfo.valid &&
                  (tran.NewLocationId || tran.freehandLocationName ||
                    ( tran.isNewLocation &&
                      tran.newLocation.name &&
                      tran.newLocation.state &&
                      tran.newLocation.county &&
                      tran.newLocation.ServicePartnerId &&
                      tran.newLocation.CustomerId
                    ) ||
                    ( tran.transferType === "REASSIGNMENT" &&
                      tran.OldServicePartnerId &&
                      tran.NewServicePartnerId
                    )
                  );
                  break;
    }

    return isValid;
  };

  return TransferAccordionService;

}]);

angular.module('TransferApp.Services')
.factory('TransferEditService', ['Transfers', 'Users', 'Locations', 'Customers', 'role',
  function (Transfers, Users, Locations, Customers, role) {

    var TransferEditService = {
      transfer: {},
      technicians: [],
      locations: []
    };

    TransferEditService.getTechnicians = function (callback) {
      console.log("transfer edit service");
      var self = this;
      if (self.transfer.unit) {
        var id = self.transfer.unit.id;
        var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
        Users.query({ where: obj },
          function (response) {
            self.technicians = response;
            obj = { ServicePartnerId: id, role: "REVIEWER" };
            Users.query({ where: obj },
              function (response) {
                self.technicians = self.technicians.concat(response);
                return callback(null);
              },
              function (err) {
                return callback(err);
              }
            );
          },
          function (err) {
            return callback(err);
          }
        );
      } else {
        return callback(null);
      }
    };

    TransferEditService.getLocations = function (callback) {
      var self = this;
      if (self.transfer.newLocation && self.transfer.newLocation.id) {
        Locations.query({ where: { CustomerId: self.transfer.newLocation.CustomerId }},
          function (response) {
            response.push({id: null, name: "Other"});
            self.locations = response;
            return callback(null);
          },
          function (err) {
            return callback(err);
          }
        );
      } else if (self.transfer.freehandLocationName) {
        Customers.query({ where: { id: self.transfer.freehandLocationCustomerId }},
          function (response) {
            self.transfer.newLocation = {};
            self.transfer.newLocation.customer = response[0];
            Locations.query(
              { where: { CustomerId: self.transfer.freehandLocationCustomerId }},
              function (response) {
                self.locations = response;
                return callback(null);
              },
              function (err) {
                return callback(err);
              }
            );
          },
          function (err) {
            return callback(err);
          }
        );
      } else {
        return callback(null);
      }
    };

    TransferEditService.load = function (transfer, callback) {
      var self = this;
      if (transfer) {
        var reassign = transfer.reassignMultipleUnits;
        if (reassign !== undefined && reassign !== null) {
          transfer.reassignMultipleUnits = transfer.reassignMultipleUnits.toString();
        }
        self.transfer = transfer;
        self.getTechnicians(function (err) {
          if (err) { return callback(err); }
          self.getLocations(function (err) {
            return callback(err);
          });
        });
      } else {
        self.transfer = emptyTransfer();
        return callback(null);
      }
    };

    TransferEditService.save = function (transfer, role, callback) {
      if (role === "ADMIN" && transfer.freehandLocationName) {
        var err = "You cannot approve a transfer with a freehand location. " +
                  "You'll need to use or create a permanent location.";
        return callback(err);
      }
      var type = transfer.transferType;
      setTransferStatus(transfer, role, true);
      transfer.UnitId = transfer.unit.id;
      if (type === "TEST" || type === "CONTRACT") {
        transfer.NewCustomerId = transfer.newLocation.customer.id;
      } else if (type === "TRANSFER" && transfer.isYardTransfer === "false") {
        transfer.NewCustomerId = transfer.newLocation.customer.id;
      }
      var conditions = transfer.id ? { id: transfer.id } : {};
      Transfers.save(conditions, transfer,
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    };


    TransferEditService.destroy = function (transfer, role, callback) {
      setTransferStatus(transfer, role, false);
      if (!transfer.status) {
        Transfers.delete({ id: transfer.id },
          function (response) { return callback(null, response); },
          function (err) { return callback(err, null); }
        );
      } else {
        transfer.UnitId = transfer.unit.id;
        Transfers.save({ id: transfer.id }, transfer,
          function (response) { return callback(null, response); },
          function (err) { return callback(err, null); }
        );
      }
    };

    TransferEditService.submitButtonText =  function (transfer) {
      var status = transfer.status;
      if (!status) {
        return "Create";
      } else if (status === "PENDING") {
        return "Submit";
      } else if (status === "SUBMITTED") {
        return "Approve";
      } else {
        return "Edit";
      }
    };

    TransferEditService.rejectButtonText = function (transfer) {
      var status = transfer.status;
      if (!status) {
        return "Cancel";
      } else if (status === "PENDING") {
        return "Delete";
      } else if (status === "SUBMITTED") {
        return "Reject";
      } else {
        return "Delete";
      }
    };

    return TransferEditService;

}]);

function emptyTransfer() {
  return {
    date:           new Date(),

    isTransfer:     true,
    transferType:   null,
    transferTypes: ["SWAP", "TRANSFER", "RELEASE", "CONTRACT", "TEST", "REASSIGNMENT"],
    isYardTransfer: "false",

    createdBy:      {}, // user
    transferOrderParts: [],
    unit:           {},
    newLocation:    { customer: {} },
    statuses:       ["PENDING", "SUBMITTED", "APPROVED"]
  };
}

function setTransferStatus (transfer, role, isProgressing) {

  if (isProgressing) {
    switch (role) {
    case "TECHNICIAN": transfer.status = "PENDING"; break;
    case "REVIEWER": transfer.status = "SUBMITTED"; break;
    case "CORPORATE": transfer.status = "APPROVED"; break;
    case "ADMIN": transfer.status = "APPROVED"; break;
    }
  } else {
    switch (role) {
      case "TECHNICIAN": transfer.status = null; break;
      case "REVIEWER": transfer.status = null; break;
      case "CORPORATE": transfer.status = "PENDING"; break;
      case "ADMIN": transfer.status = "PENDING"; break;
    }
  }
}

angular.module('UserApp.Controllers').controller('UserEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Users', 'user', 'servicePartners', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, Users, user, servicePartners, role) {

    $scope.title = user ? "Edit " + user.firstName + " " + user.lastName :
                          "Create a new user";

    $scope.user = user;
    $scope.servicePartners = servicePartners;
    if (role === 'ADMIN') {
      $scope.roles = ["TECHNICIAN", "REVIEWER", "CORPORATE", "ADMIN"];
    } else if (role === 'CORPORATE'){
      $scope.roles = ["TECHNICIAN", "REVIEWER", "CORPORATE"];
    } else if (role === 'REVIEWER'){
      $scope.roles = ["TECHNICIAN", "REVIEWER"];
    } else {
      $scope.roles = ["TECHNICIAN"];
    }


    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.user.id) {
        // Edit an existing user.
        Users.save({id: user.id}, $scope.user,
          function (response) {
            $location.path("/user");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new user.
        Users.save({}, $scope.user,
          function (response) {
            $location.path("/user");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Users.delete({id: user.id},
        function (response) {
          $location.path("/user");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('UserApp.Controllers').controller('UserIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'users',
  function ($scope, $route, $location, AlertService, LoaderService, users) {

    $scope.title = "Users";

    $scope.users = users;

    $scope.editUser = function (id) {
      $location.path("/user/edit/" + (id || ""));
    };

    $scope.createUser = function () {
      $scope.editUser();
    };

    /* *************************************************************************
    Table sort and search functionality (TODO: make this a service)
    ************************************************************************* */
    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "First Name",  objKey: "firstName" },
        { title: "Last Name",   objKey: "lastName" },
        { title: "Email",       objKey: "email" },
      ];
    }

    function getTableSort () {
      return {
        column: "firstName",
        descending: false,
      };
    }

    var tableRowAction = function (obj) {
      $scope.editUser(obj.id);
    };

    var tableHeaderAction = function (obj) {
      $scope.createUser();
    };

    function getTableRowButtons () {
      var arr = [];

      var button = {};
      button.title = "edit";
      button.action = tableRowAction;

      arr.push(button);

      return arr;
    }

    function getTableHeaderButtons() {
      var arr = [];

      var button = {};
      button.title = "new user";
      button.action = tableHeaderAction;

      arr.push(button);
      return arr;
    }

    $scope.tableModel = {
      tableName: "Users", // displayed at top of page
      objectList: $scope.users, // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
      sort: getTableSort(),
      rowClickAction: tableRowAction,
      rowButtons: getTableRowButtons(),
      headerButtons: getTableHeaderButtons(),

    };

}]);

angular.module('UnitApp.Controllers').controller('UnitEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Units', 'unit', 'servicePartners', 'Locations',
  function ($scope, $route, $location, AlertService, LoaderService, Units, unit, servicePartners, Locations) {

    $scope.title = unit ? "Edit unit number " + unit.number :
                          "Create a new unit";

    $scope.unit = unit || newUnit();
    $scope.unit.pressureRating = $scope.unit.pressureRating || "LOW";
    $scope.unit.status = $scope.unit.status || getImpliedStatus();
    $scope.servicePartners = servicePartners;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.unit.id) {
        // Edit an existing unit.
        Units.save({id: unit.id}, $scope.unit,
          function (response) {
            $location.path("/unit");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new unit.
        Units.save({}, $scope.unit,
          function (response) {
            $location.path("/unit");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Units.delete({id: unit.id},
        function (response) {
          $location.path("/unit");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    function getImpliedStatus() {
      var hasCustomer = $scope.unit.CustomerId;
      var isOnYard = $scope.unit.location && $scope.unit.location.isYard();
      if (isOnYard) {
        return "IDLE AVAILABLE";
      } else if (hasCustomer) {
        return "ACTIVE LEASE";
      }
    }

    function newUnit() {
      return {
        statuses: ["IDLE AVAILABLE", "IDLE COMMITTED"],
        engineHours: 0,
        compressorHours: 0
      };
    }

    $scope.$watch('unit.ServicePartnerId', function (newVal, oldVal) {
      var id = newVal;
      if (id !== null && id !== undefined) {
        $scope.locations = [];
        $scope.locationsLoading = true;
        Locations.query({ where: { ServicePartnerId: id} },
          function (response) {
            $scope.locationsLoading = false;
            $scope.locations = filterLocations(response);
          },
          function (err) {
            $scope.locationsLoading = false;
            AlertService.add("error", err);
          }
        );
      }
    }, true);

    function filterLocations (locations) {
      var newLocations = locations.filter(function (location) {
        var shouldBeIncluded = true;
        if (!$scope.unit.id) {
          if (location.isYard() === false) {
            shouldBeIncluded = false;
          }
        }
        return shouldBeIncluded;
      });
      return newLocations;
    }

}]);

angular.module('UnitApp.Controllers').controller('UnitIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'units', '$cookies', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, units, $cookies, role) {

    $scope.title = "Units";

    $scope.units = units;
    $scope.userName = $cookies.userName;
    $scope.role = role;

    $scope.editUnit = function (id) {
      $location.path("/unit/edit/" + (id || ""));
    };

    $scope.createUnit = function () {
      $scope.editUnit();
    };

    $scope.sort = {
      column: "number",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      if ($scope.sort.column == column) {
        $scope.sort.descending = !$scope.sort.descending;
      } else {
        $scope.sort.column = column;
        $scope.sort.descending = false;
      }
    };

    (function () {
      $scope.allowEdit = false;
      var name = $scope.userName;
      if (name === 'Jonathan Mitchell') {
        $scope.allowEdit = true;
      }
      else if (role === "ADMIN") {
        $scope.allowEdit = true;
      }
    })();

}]);

angular.module('VendorApp.Controllers').controller('VendorEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Vendors', 'vendor', 'vendorFamilies', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, Vendors, vendor, vendorFamilies, role) {

    $scope.title = vendor ? "Edit " + vendor.name : "Create a new vendor";

    if (vendor) {
      $scope.vendor = vendor;
    }

    $scope.vendorFamilies = vendorFamilies;

    $scope.vendorFamilies.push({name: "Other", id: 0});

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.vendor.id) {
        // Edit an existing vendor.
        Vendors.save({id: vendor.id}, $scope.vendor,
          function (response) {
            $location.path("/vendor");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new vendor.
        Vendors.save({}, $scope.vendor,
          function (response) {
            $location.path("/vendor");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Vendors.delete({id: vendor.id},
        function (response) {
          $location.path("/vendor");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('VendorApp.Controllers').controller('VendorIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'vendors',
  function ($scope, $route, $location, AlertService, LoaderService, vendors) {

    $scope.title = "Vendors";

    $scope.vendors = vendors;

    $scope.editVendor = function (id) {
      $location.path("/vendor/edit/" + (id || ""));
    };

    $scope.createVendor = function () {
      $scope.editVendor();
    };

    $scope.sort = {
      column: "name",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);

angular.module('VendorPartApp.Controllers').controller('VendorPartEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'VendorParts', 'vendorpart','vendors', 'parts', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, VendorParts, vendorpart, vendors, parts, role) {

    $scope.title = vendorpart ? "Edit " + vendorpart.vendorPartNumber :
                                "Create a new vendor";

    if (vendorpart) {
      $scope.vendorpart = vendorpart;
    }

    $scope.vendors = vendors;
    $scope.parts = parts;

    $scope.$watch('vendorpart.PartId', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        var oldPart = getPartById(oldVal);
        var newPart = getPartById(newVal);
        if (!$scope.vendorpart.vendorPartDescription) {
          $scope.vendorpart.vendorPartDescription = newPart.description;
        } else if ($scope.vendorpart.vendorPartDescription === oldPart.description) {
          $scope.vendorpart.vendorPartDescription = newPart.description;
        } else {
          // user has input a description.
          // don't change it automatically.
        }
      }
    }, true);

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.vendorpart.id) {
        // Edit an existing vendor.
        VendorParts.save({id: vendorpart.id}, $scope.vendorpart,
          function (response) {
            $location.path("/vendorpart");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new vendor.
        VendorParts.save({}, $scope.vendorpart,
          function (response) {
            $location.path("/vendorpart");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      VendorParts.delete({id: vendorpart.id},
        function (response) {
          $location.path("/vendorpart");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    function getPartById (id) {
      if (!id) { return null; }
      var parts = $scope.parts.filter(function (p) {
        return p.id === id;
      });
      if (parts.length < 0) { return null; }
      return parts[0];
    }

}]);

angular.module('VendorPartApp.Controllers').controller('VendorPartIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'vendorparts',
  function ($scope, $route, $location, AlertService, LoaderService, vendorparts) {

    $scope.title = "Vendor Parts";

    $scope.vendorparts = vendorparts;

    $scope.editVendorPart = function (id) {
      $location.path("/vendorpart/edit/" + (id || ""));
    };

    $scope.createVendorPart = function () {
      $scope.editVendorPart();
    };

    $scope.sort = {
      column: "name",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$scope', '$location', 'AlertService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts', 'WorkOrderEditService', 'WorkOrderAccordionService', 'role', '$window',
  function ($scope, $location, AlertService, WorkOrders, workorder, units, customers, users, parts, WorkOrderEditService, WorkOrderAccordionService, role, $window) {

    $scope.title = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    // Assign all of the objects.
    WorkOrderEditService.load(workorder, function (err) {
      if (err) {
        AlertService.add("danger", err);
      } else {
        $scope.workorder = WorkOrderEditService.workorder;
        $scope.technicians = WorkOrderEditService.technicians;
        // Setup the button text.
        $scope.submitButtonText =
          WorkOrderEditService.submitButtonText($scope.workorder);
        $scope.rejectButtonText =
          WorkOrderEditService.rejectButtonText($scope.workorder);
          // Set up the accordion.
        $scope.accordion = WorkOrderAccordionService.instantiate($scope.workorder);
        $scope.activePanel = "general-information";
        $scope.oneAtATime = !$scope.workorder.id;
      }
    });

    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.role = role;
    $window.scope = $scope;

    // Watches the workorder to control form navigation and validation.
    $scope.$watch('workorder', function (newVal, oldVal) {
      var validate = WorkOrderAccordionService.sectionIsValid;
      for (var key in $scope.accordion) {
        var isValid = validate(key, $scope.accordion, $scope.workorder);
        $scope.accordion[key].valid = isValid;
      }
    }, true);


    $scope.crossPopulate = function () {
      var engineHours = $scope.workorder.engineHours;
      var compressorHours = $scope.workorder.compressorHours;
      if (engineHours && !compressorHours) {
        $scope.workorder.compressorHours = $scope.workorder.engineHours;
        return;
      }
      if (compressorHours && !engineHours) {
        $scope.workorder.engineHours = $scope.workorder.compressorHours;
        return;
      }
    };

    // Opens all of the accordion tabs. This breaks inside the service.
    $scope.toggleAll = function () {
      $scope.oneAtATime = !$scope.oneAtATime;
      if ($scope.oneAtATime) {
        $scope.accordion.genInfo.open = false;
        $scope.accordion.hardware.open = false;
        $scope.accordion.logs.open = false;
        $scope.accordion.callOut.open = false;
        $scope.accordion.highPressure.open = false;
        $scope.accordion.parts.open = false;
      } else {
        $scope.accordion.genInfo.open = true;
        $scope.accordion.hardware.open = true;
        $scope.accordion.logs.open = true;
        $scope.accordion.callOut.open = true;
        $scope.accordion.highPressure.open = true;
        $scope.accordion.parts.open = true;
      }
    };

    $scope.showHistory = false;
    $scope.toggleHistory = function () {
      $scope.showHistory = !$scope.showHistory;
    };


    $scope.save = function () {
      $scope.submitting = true;
      WorkOrderEditService.save($scope.workorder, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      WorkOrderEditService.destroy($scope.workorder, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success", $scope.submitButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

}]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders', 'ArrayFilterService',
  function ($scope, $route, $location, AlertService, LoaderService, workorders, ArrayFilterService) {

    $scope.title = "Work Orders";

    $scope.workorders = workorders;

    $scope.searchPhrase = null;
    $scope.searchLength = null;

    $scope.editWorkOrder = function (id) {
      $location.path("/workorder/edit/" + (id || ""));
    };

    $scope.createWorkOrder = function () {
      $scope.editWorkOrder();
    };

    $scope.sort = {
      column: ["status", "date", "number"],
      descending: [true],
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.searchWorkorders = function (searchPhrase) {
      console.log(searchPhrase);
      if(searchPhrase === ""){
        $scope.workorders = workorders;
        $scope.onlyShowRecentWorkOrders();
      }
      else{
        ArrayFilterService.filter(workorders, searchPhrase, function (err, results) {
          $scope.workorders = results;
        });
      }
    };

    $scope.onlyShowRecentWorkOrders = function () {
      $scope.workorders = $scope.workorders.filter(function (wo) {
        if (wo.status !== "APPROVED") {
          return true;
        } else {
          var lastChange = new Date(wo.updatedAt);
          var now = new Date();
          var days = daysBetween(lastChange, now);
          if (days > 31) { // if over a month old
            return false;
          } else {
            return true;
          }
        }
      });
    };

    function daysBetween(first, second) {
      // this function courtesy of stack overflow
      // http://stackoverflow.com/questions/1036742/date-difference-in-javascript-ignoring-time-of-day
      // Copy date parts of the timestamps, discarding the time parts.
      var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
      var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

      // Do the math.
      var millisecondsPerDay = 1000 * 60 * 60 * 24;
      var millisBetween = two.getTime() - one.getTime();
      var days = millisBetween / millisecondsPerDay;

      // Round down.
      return Math.floor(days);
    }

    (function () { $scope.onlyShowRecentWorkOrders(); })();

}]);

angular.module('WorkOrderApp.Services')
.factory('WorkOrderAccordionService', [function () {

  var WorkOrderAccordionService = {};

  WorkOrderAccordionService.instantiate = function (workorder) {
    var isCreate = !workorder.id;
    return {
      genInfo:      { open: true,      disabled: false, valid: false },
      hardware:     { open: !isCreate, disabled: true,  valid: false },
      logs:         { open: !isCreate, disabled: true,  valid: false },
      callOut:      { open: !isCreate, disabled: true,  valid: false },
      highPressure: { open: !isCreate, disabled: true,  valid: false },
      parts:        { open: !isCreate, disabled: true,  valid: false }
    };
  };

  WorkOrderAccordionService.sectionIsValid = function (section, accordion, workorder) {
    var isValid = false;
    var wo = workorder;

    switch (section) {

      case "genInfo":
        isValid = wo.date &&
                  wo.unit.number;
                  break;

      case "hardware":
        isValid = accordion.genInfo.valid &&
                  wo.suction.length !== 0 &&
                  wo.discharge.length !== 0 &&
                  wo.flowrate.length !== 0 &&
                  wo.engineHours.length !== 0 &&
                  wo.engineOilPressure.length !== 0 &&
                  wo.jwTemperature.length !== 0 &&
                  wo.rpm.length !== 0 &&
                  wo.manifoldVac.length !== 0 &&
                  wo.compressorHours.length !== 0 &&
                  wo.compressorOilPressure.length !== 0;
                  break;

      case "logs":
        isValid = accordion.hardware.valid &&
                  wo.workOrderLogs;
                  break;

      case "callOut":
        isValid = accordion.logs.valid &&
                  (wo.isCallOut !== true || (
                   wo.calledOutBy &&
                   wo.timeCalled &&
                   wo.timeDeparted &&
                   wo.timeArrived &&
                   wo.callOutReason
                  ));
                  break;

      case "highPressure":
        isValid = accordion.logs.valid &&
                  ((wo.isHighPressure !== true) || (!!wo.pressureRating));
                  break;

      case "parts":
        isValid = accordion.logs.valid &&
                  wo.workOrderParts;
                  break;

    }
    return isValid;
  };

  return WorkOrderAccordionService;

}]);

angular.module('WorkOrderApp.Services')
.factory('WorkOrderEditService', ['WorkOrders', 'Users', 'role', '$cookies', function (WorkOrders, Users, role, $cookies) {

  var WorkOrderEditService = {
    workorder: {},
    technician: []
  };

  WorkOrderEditService.load = function (workorder, callback) {
    var self = this;
    if (workorder) {
      self.workorder = workorder;
      self.workorder.timeCalled = workorder.timeCalled.split(".")[0];
      self.workorder.timeDeparted = workorder.timeDeparted.split(".")[0];
      self.workorder.timeArrived = workorder.timeArrived.split(".")[0];
      self.loadTechnicians(callback);
    } else {
      self.workorder = emptyWorkOrder();
      return callback(null);
    }
    return self.workorder;
  };

  WorkOrderEditService.loadTechnicians = function (callback) {
    var self = this;
    var id = null;
    if (self.workorder.unit) {
      id = self.workorder.unit.ServicePartnerId;
    }
    if (id) {
      var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
      Users.query({ where: obj },
        function (response) {
          self.technicians = response;
          obj = { ServicePartnerId: id, role: "REVIEWER" };
          Users.query({ where: obj },
            function (response) {
              self.technicians = self.technicians.concat(response);
              return callback(null);
            },
            function (err) {
              return callback(err);
            }
          );
        },
        function (err) {
          return callback(err);
        }
      );
    } else {
      return callback(null);
    }
  };

  WorkOrderEditService.save = function (workorder, role, callback) {

    var logsWithoutTimes = workorder.workOrderLogs.filter(function (woLog) {
      return (woLog.hours === 0 && woLog.minutes === 0);
    });
    var isConfirmRequired = logsWithoutTimes.length > 0;
    var conditions;
     
    if (isConfirmRequired) {
      var text = 'This workorder contains some' +
      ' Types of Work Performed Line Items that do not have hours or minutes.' +
      ' Are you sure you wish to save?';

      if (confirm(text)) {
        setWorkOrderStatus(workorder, role, true);
        workorder.UnitId = workorder.unit.id;
        conditions = workorder.id ? { id: workorder.id } : {};
        WorkOrders.save(conditions, workorder,
          function (response) { return callback(null, response); },
          function (err) { return callback(err, null); }
        );
      } else {
        return callback("Please edit the line items and then save again.");
      }
    } else {
      setWorkOrderStatus(workorder, role, true);
      workorder.UnitId = workorder.unit.id;
      conditions = workorder.id ? { id: workorder.id } : {};
      WorkOrders.save(conditions, workorder,
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    }


  };

  WorkOrderEditService.destroy = function (workorder, role, callback) {
    console.log(workorder.status);
    setWorkOrderStatus(workorder, role, false);
    console.log(workorder.status);
    if (!workorder.status) {
      WorkOrders.delete({ id: workorder.id },
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    } else {
      workorder.UnitId = workorder.unit.id;
      WorkOrders.save({ id: workorder.id }, workorder,
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    }
  };

  WorkOrderEditService.submitButtonText =  function (workorder) {
    var status = workorder.status;
    if (!status || role === "TECHNIAN") {
      return "Create";
    } else if (status === "PENDING" || role === "REVIEWER") {
      return "Submit";
    } else if (status === "SUBMITTED" || role === "CORPORATE") {
      return "Approve";
    } else if (status === "SUBMITTED" || role === "ADMIN") {
      return "Approve";
    } else {
      return "Edit";
    }
  };

  WorkOrderEditService.rejectButtonText = function (workorder) {
    var status = workorder.status;
    if (!status) {
      return "Cancel";
    } else if (status === "PENDING") {
      return "Delete";
    } else if (status === "SUBMITTED") {
      return "Reject";
    } else {
      return "Delete";
    }
  };

  function setWorkOrderStatus (workorder, role, isProgressing) {
    if (isProgressing) {
      switch (role) {
        case "TECHNICIAN": workorder.status = "SUBMITTED"; break;
        case "REVIEWER": workorder.status = "APPROVED"; break;
        case "CORPORATE": workorder.status = "APPROVED"; break;
        case "ADMIN": workorder.status = "APPROVED"; break;
      }
    } else {
      var userId = $cookies.userId || 0;
      if (userId === workorder.CreatedById) {
        workorder.status = null;
        return;
      } else {
        switch (role) {
          case "TECHNICIAN": workorder.status = null; break;
          case "REVIEWER": workorder.status = "SUBMITTED"; break;
          case "CORPORATE": workorder.status = "SUBMITTED"; break;
          case "ADMIN": workorder.status = "SUBMITTED"; break;
        }
      }
    }
  }


  return WorkOrderEditService;

}]);

function emptyWorkOrder() {
  return {
    date:                   new Date(),
    reason:                 "",
    details:                "",
    isTransfer:             false,
    calledOutBy:            "",

    // Application
    suction:                0,
    discharge:              0,
    flowrate:               0,
    // Engine
    engineHours:            0,
    engineOilPressure:      0,
    jwTemperature:          0,
    rpm:                    0,
    manifoldVac:            0,
    // Compressor
    compressorHours:        0,
    compressorOilPressure:  0,
    // Call Out
    timeCalled:             new Date(),
    timeDeparted:           new Date(),
    timeArrived:            new Date(),
    callOutReason:          new Date(),
    // Engine Swap
    engineSerial:           "",
    engineModel:            "",
    // Compressor Swap
    compressorSerial:       "",
    compressorModel:        "",

    createdBy:              {}, // user
    workOrderParts:         [], // parts
    workOrderLogs:          [], // labor logs
    unit:                   {}, // user
    technician:             {}, // technician

    statuses:               ["PENDING", "SUBMITTED", "APPROVED"]
  };
}

angular.module('PartApp.Controllers').controller('PartsVendorPartsCtrl',
['$scope', '$location', 'AlertService', 'VendorParts',
function ($scope, $location, AlertService, VendorParts) {

  // Adds the current part to the table and empties out the new part form.
  $scope.addNewVendorPart = function () {
    var vp = $scope.newVendorPart;

    // we need to pull the name off of the vendor for UI reasons
    var vendorName = $scope.vendors.filter(function (v) {
      return v.id === vp.VendorId;
    })[0].name;

    // add fill it out the way it's loaded from the DB
    vp.vendor = {
      name: vendorName
    };

    // need to allow simultaneous part creation and vendor tagging.
    // first case: part hasn't been saved yet.
    if (!vp.PartId) {
      // need to allow simultaneous part creation and vendor tagging.
      if (!$scope.unsavedVendorParts) { $scope.part.unsavedVendorParts = []; }
      $scope.part.unsavedVendorParts.push(vp);
      $scope.part.vendorParts.push(vp);
      $scope.newVendorPart = $scope.emptyVendorPart();
    // second case: part already exists
    } else {
      // Create a new vendor part in the database.
      VendorParts.save({}, vp,
        function (response) {
          AlertService.add("success", "That vendor was successfully added.");
          $scope.submitting = false;
          $scope.part.vendorParts.push(response);
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
      $scope.newVendorPart = $scope.emptyVendorPart();
    }

  };

  // Removes a vendor part from the database
  $scope.removeVendorPart = function (index) {
    var removedPart = $scope.part.vendorParts.splice(index,1);
    var id = removedPart[0].id;
    $scope.submitting = true;
    VendorParts.delete({id: id},
      function (response) {
        AlertService.add("success", "That vendor was successfully removed.");
        $scope.submitting = false;
      },
      function (err) {
        AlertService.add("error", err);
        $scope.submitting = false;
        $scope.part.vendorParts.push(removedPart);
      }
    );
  };

  // Routes user to vendor part edit page.
  $scope.editVendorPart = function (index) {
    var id = $scope.part.vendorParts[index].id;
    console.log(id);
    $location.path("/vendorpart/edit/" + id);
  };

  $scope.emptyVendorPart = function () {
    return {
      PartId: $scope.part.id,
      VendorId: null,
      vendorPartNumber: null,
      vendorPartDescription: $scope.part.description,
      vendorPartCost: 0
    };
  };

  (function () {
    $scope.newVendorPart = $scope.emptyVendorPart();
  })();

}]);

angular.module('TransferApp.Controllers').controller('TransferDetailsCtrl',
['$scope', 'AlertService', 'LoaderService', 'Locations', 'Users', 'Units', 'GeographyService',
  function ($scope, AlertService, LoaderService, Locations, Users, Units, GeographyService) {

    $scope.$watch('transfer.transferType', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        resetStateData();
        switch (newVal) {
          case "SWAP":
              // Do everything necessary to show 2 units from same service partner.
              $scope.transfer.newLocation.customer.dbaCustomerName =
                $scope.transfer.unit.customer.dbaCustomerName;
              $scope.transfer.newLocation.servicePartner =
                $scope.transfer.unit.servicePartner;
            break;
          case "TRANSFER":
              // Show other leases, same service partner, potentially differnt customer.
              //TODO: no changes
            break;
          case "RELEASE":
              // Just show the yards
              $scope.transfer.newLocation.customer.dbaCustomerName =
                null;
              $scope.transfer.newLocation.servicePartner =
                $scope.transfer.unit.servicePartner;
            break;
          case "CONTRACT":
              // Allow the user to select all info.
            break;
          case "TEST":
              // Allow the user to select all info.
            break;
          case "REASSIGNMENT":
            $scope.transfer.OldServicePartnerId = $scope.transfer.unit.ServicePartnerId;
            $scope.transfer.reassignMultipleUnits = "false";
            break;
        }
      }
    }, true);

    $scope.$watch('transfer.newLocation.customer.dbaCustomerName',
    function (newVal, oldVal) {
      if (newVal !== oldVal) {
        var type = $scope.transfer.transferType;

        if (type === "TRANSFER" || type === "CONTRACT" || type === "TEST") {
          // allow the user to select the customer

          var customerId;
          for (var i = 0, len = $scope.customers.length; i < len; i++) {
            if ($scope.customers[i].dbaCustomerName === newVal) {
              $scope.transfer.newLocation.customer = angular.copy($scope.customers[i]);
              customerId = $scope.transfer.newLocation.customer.id;
              $scope.transfer.newLocation.CustomerId = $scope.transfer.newLocation.customer.id;
            }
          }

          if (customerId) {
            $scope.locations = [];
            $scope.locationsLoading = true;
            Locations.query({ where: { CustomerId: customerId } },
              function (response) {
                $scope.locationsLoading = false;
                $scope.locations = filterLocationsByTransferType(response);
                $scope.locations.push({id: null, name: "Other"});
              },
              function (err) {
                $scope.locationsLoading = false;
                AlertService.add("error", err);
              }
            );
          }

        } else if (type === "RELEASE" || type === "SWAP") {
          // customer is preselcted, just load the yards for the service partner
          var servicePartnerId = $scope.transfer.newLocation.servicePartner.id;
          Locations.query({ where: { ServicePartnerId: servicePartnerId } },
            function (response) {
              $scope.locationsLoading = false;
              $scope.locations = filterLocationsByTransferType(response);
              if (type === "RELEASE") {
                $scope.locations.push({id: null, name: "Other"});
              }
            },
            function (err) {
              $scope.locationsLoading = false;
              AlertService.add("error", err);
            }
          );
        }
      }
    }, true);

    $scope.$watch('transfer.NewLocationId',
    function (newVal, oldVal) {
      if (newVal !== oldVal && newVal !== null) {
        for (var i = 0, len = $scope.locations.length; i < len; i++) {
          if ($scope.locations[i].id === newVal) {
            $scope.allowFreehandLocation = false;
            $scope.transfer.freehandLocationCustomerId = null;
            $scope.transfer.freehandLocationName = null;
            $scope.transfer.freehandLocationCounty = null;
            $scope.transfer.newLocation = angular.copy($scope.locations[i]);
            break;
          }
        }
        if ($scope.transfer.transferType === "SWAP") {
          Units.query({ where: { LocationId: newVal } },
            function (response) {
              $scope.unitsLoading = false;
              $scope.swapUnits = response;
            },
            function (err) {
              $scope.unitsLoading = false;
              AlertService.add("error", err);
            }
          );
        }
      } else if (newVal !== oldVal && newVal === null) {
        $scope.allowFreehandLocation = true;
        if ($scope.transfer.newLocation) {
          $scope.transfer.freehandLocationCustomerId =
            $scope.transfer.newLocation.customer.id;
        }
      }
    }, true);

    $scope.$watch('transfer.NewServicePartnerId', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        var id = newVal;
        if ( ($scope.transfer.transferType === "TRANSFER" ||
              $scope.transfer.transferType === "RELEASE") &&
              $scope.transfer.isYardTransfer === "true") {

          $scope.locations = [];
          $scope.locationsLoading = true;
          Locations.query({ where: { ServicePartnerId: id, locationType: "Yard" } },
            function (response) {
              $scope.locationsLoading = false;
              $scope.locations = filterLocationsByTransferType(response);
            },
            function (err) {
              $scope.locationsLoading = false;
              AlertService.add("error", err);
            }
          );

        } else {

          $scope.newTechniciansLoading = true;
          if ($scope.transfer.isNewLocation) {
            $scope.transfer.newLocation.ServicePartnerId = id;
          }
          var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
          Users.query({ where: obj },
            function (response) {
              $scope.technicians = response;
              obj = { ServicePartnerId: id, role: "REVIEWER" };
              Users.query({ where: obj },
                function (response) {
                  $scope.technicians = $scope.technicians.concat(response);
                  $scope.techniciansLoading = false;
                },
                function (err) {
                  AlertService.add("danger", err);
                });
            },
            function (err) {
              AlertService.add("danger", err);
            });

        }
      }
    }, true);

    $scope.$watch('transfer.NewTechnicianId', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.transfer.isNewLocation) {
          $scope.technicians = $scope.newTechnicians;
          $scope.transfer.TechnicianId = newVal;
          $scope.transfer.technician = $scope.technicians.filter(function (m) {
            return m.id === newVal;
          })[0];
        }
      }
    }, true);

    $scope.$watch('transfer.SwapUnitId', function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.swapUnits) {
        for (var i = 0, len = $scope.swapUnits.length; i < len; i++) {
          if ($scope.swapUnits[i].id === newVal) {
            $scope.transfer.swapUnit = angular.copy($scope.swapUnits[i]);
          }
        }
      }
    });

    $scope.$watch('transfer.isNewLocation', function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.transfer.newLocation) {
        var state = $scope.transfer.newLocation.state;
        $scope.counties = GeographyService.counties(state);
      }
    });

    $scope.$watch('transfer.newLocation.state', function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.transfer.isNewLocation) {
        $scope.transfer.newLocation.county = null;
        $scope.counties = GeographyService.counties(newVal);
      }
    });


    function filterLocationsByTransferType (locations) {
      var type = $scope.transfer.transferType;
      var newLocations = locations.filter(function (location) {

        var shouldBeIncluded = true;

        if (type === "SWAP" || type === "RELEASE") {
          if (location.locationType === "Lease" || location.locationType === "Truck") {
            shouldBeIncluded = false;
          }
        }

        if (type === "CONTRACT" || type === "TEST") {
          if (location.locationType === "Yard" || location.locationType === "Truck") {
            shouldBeIncluded = false;
          }
        }

        return shouldBeIncluded;
      });
      return newLocations;
    }

    function resetStateData() {
      if ($scope.transfer.newLocation) {
        $scope.transfer.newLocation.customer.dbaCustomerName = null;
        $scope.transfer.newLocation.servicePartner = null;
      }
      $scope.transfer.OldServicePartnerId = null;
      $scope.transfer.reassignMultipleUnits = null;
    }

}]);

angular.module('TransferApp.Controllers').controller('TransferInformationCtrl',
['$scope', 'AlertService', 'LoaderService', 'TransferAccordionService', 'Users', 'role',
  function ($scope, AlertService, LoaderService, TransferAccordionService, Users, role) {

  // Watches the transfer to control form navigation and validation.
  $scope.$watch('transfer', function (newVal, oldVal) {
    var validate = TransferAccordionService.sectionIsValid;
    for (var key in $scope.accordion) {
      var isValid = validate(key, $scope.accordion, $scope.transfer);
      $scope.accordion[key].valid = isValid;
    }
  }, true);

  // Watches the unit number to prefil the form data

  $scope.$watch('transfer.unit.number', function (newVal, oldVal) {
    if (newVal !== oldVal && $scope.loadingData !== true) {
      for (var i = 0, len = $scope.units.length; i < len; i++) {
        if ($scope.units[i].number === newVal) {
          // deep copy the unit from the collection to prevent the data
          // from being overwritten by the ng-model bindings on the form.
          $scope.transfer.unit = angular.copy($scope.units[i]);
          if ($scope.transfer.unit.location) {
            $scope.transfer.oldLocation = $scope.transfer.unit.location;
            $scope.transfer.OldLocationId = $scope.transfer.unit.location.id;
          }
          if ($scope.transfer.transferType === "REASSIGNMENT") {
            $scope.transfer.OldServicePartnerId = $scope.transfer.unit.ServicePartnerId;
          }
        }
      }
    }
  }, true);

  $scope.$watch('transfer.unit', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      var id = $scope.transfer.unit.ServicePartnerId;
      $scope.techniciansLoading = true;
      var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
      Users.query({ where: obj },
        function (response) {
          $scope.technicians = response;
          obj = { ServicePartnerId: id, role: "REVIEWER" };
          Users.query({ where: obj },
            function (response) {
              $scope.technicians = $scope.technicians.concat(response);
              $scope.techniciansLoading = false;
            },
            function (err) {
              AlertService.add("danger", err);
            });
        },
        function (err) {
          AlertService.add("danger", err);
        });
    }
  }, true);

  $scope.$watch('transfer.TechnicianId', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      $scope.technicians.forEach(function (element, index, array) {
        if (element.id === $scope.transfer.TechnicianId) {
          $scope.transfer.technician = element;
        }
      });
    }
  }, true);

  $scope.filterNewSet = function (transfer) {
    return (transfer === "CONTRACT" || transfer === "TEST");
  };

  $scope.filterUnitMove = function (transfer) {
    return (transfer !== "CONTRACT" && transfer !== "TEST" &&
            transfer !== "REASSIGNMENT");
  };

  $scope.filterReassignment = function (transfer) {
    return (transfer === "REASSIGNMENT");
  };

}]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderCalloutCtrl',
['$scope', 'AlertService',
  function ($scope, AlertService) {

  $scope.callOutReasons =  [
    "PRODUCTION RELATED",
    "ELECTRICAL ISSUES",
    "MECHANICAL-ENGINE",
    "MECHANICAL-COMPRESSOR"
  ];

}]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderInformationCtrl',
['$scope', 'AlertService', 'Users',
  function ($scope, AlertService, Users) {

  // Watches the unit number to prefil the form data
  $scope.$watch('workorder.unit.number', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      for (var i = 0, len = $scope.units.length; i < len; i++) {
        if ($scope.units[i].number === newVal) {
          // deep copy the unit from the collection to prevent the data
          // from being overwritten by the ng-model bindings on the form.
          $scope.workorder.unit = angular.copy($scope.units[i]);
        }
      }
    }
  }, true);

  $scope.$watch('workorder.unit', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      var id = $scope.workorder.unit.ServicePartnerId;
      $scope.techniciansLoading = true;
      var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
      Users.query({ where: obj },
        function (response) {
          $scope.technicians = response;
          obj = { ServicePartnerId: id, role: "REVIEWER" };
          Users.query({ where: obj },
            function (response) {
              $scope.technicians = $scope.technicians.concat(response);
              $scope.techniciansLoading = false;
            },
            function (err) {
              AlertService.add("danger", err);
            });
        },
        function (err) {
          AlertService.add("danger", err);
        });
    }
  }, true);

  // Watches the Technician and loads the object onto the workorder.
  $scope.$watch('workorder.TechnicianId', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      $scope.technicians.forEach(function (element, index, array) {
        if (element.id === $scope.workorder.TechnicianId) {
          $scope.workorder.technician = element;
        }
      });
    }
  }, true);

}]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderLogsCtrl',
['$scope', 'enumeration', 'AlertService', function ($scope, enumeration, AlertService) {

  $scope.enumeration = enumeration.workorder;
  $scope.typeNames = $scope.enumeration.typeNames();
  $scope.systemNames = $scope.enumeration.systemNames();
  $scope.typeOfWorkPerformedNames = $scope.enumeration.typeOfWorkPerformedNames();
  $scope.hoursList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  $scope.minutesList = [0, 15, 30, 45];

  // Creates a new part for out parts.html page and directive.
  $scope.emptyWorkOrderLog = function () {
    return {
      WorkOrderId: null,
      typeOfWorkPerformed: null,
      system: null,
      subsystem: null,
      type: null,
      subtype: null,
      hours: 0,
      minutes: 0
    };
  };

  // Initialize the newPart variable with the appropriate data.
  $scope.newWorkOrderLog = $scope.emptyWorkOrderLog();

  $scope.lineItemSubmissionDisabled = true; // initial UI config
  $scope.subtypeSelectionDisabled = true; // initial UI config
  $scope.systemSelectionDisabled = true; // initial UI config

  // Removes a part from the table on the parts.html page.
  $scope.removeLog = function (index) {
    $scope.workorder.workOrderLogs.splice(index,1);
  };

  // Adds the current part to the table and empties out the new part form.
  $scope.addNewLog = function () {
    var log = $scope.newWorkOrderLog;
    if (log.hours === 0 && log.minutes === 0) {
      var description = "You've added a workorder line item without times. " +
              "Please remove it and redo this line item if this was in error.";
      AlertService.add("danger", description, 15);
    }
    $scope.workorder.workOrderLogs.push(log);
    $scope.newWorkOrderLog = $scope.emptyWorkOrderLog();
  };

  $scope.$watch('newWorkOrderLog.system', function (newVal, oldVal) {
    if (newVal !== oldVal) {

      var system = $scope.newWorkOrderLog.system;

      if (system) {
        $scope.subsystemNames =
          $scope.enumeration.subsystemNames($scope.newWorkOrderLog);

        if (system !== 0) { // Optimization
          $scope.subsystemSelectionDisabled = false;
        }

      } else {
        $scope.subsystemSelectionDisabled = true;
        $scope.newWorkOrderLog.subsystem = null;
        $scope.newWorkOrderLog.subsystemNames = [];
      }
    }
  }, true);

  $scope.$watch('newWorkOrderLog.type', function (newVal, oldVal) {
    if (newVal !== oldVal) {

      var type = $scope.newWorkOrderLog.type;

      if (type) {

        $scope.subtypeNames =
          $scope.enumeration.subtypeNames($scope.newWorkOrderLog);

        $scope.lineItemSubmissionDisabled = false;

        if (type === 1) { // pm
          $scope.subtypeSelectionDisabled = true;
          $scope.systemSelectionDisabled = true;
          $scope.newWorkOrderLog.system = null;
          $scope.newWorkOrderLog.subsystem = null;
        } else if (type === 2 || type === 4) { // un-scheduled or shop work
          $scope.subtypeSelectionDisabled = false;
          $scope.systemSelectionDisabled = false;
        } else {
          $scope.subtypeSelectionDisabled = false;
          $scope.systemSelectionDisabled = true;
          $scope.newWorkOrderLog.system = null;
          $scope.newWorkOrderLog.subsystem = null;
        }

      } else {
        $scope.newWorkOrderLog.subtypeNames = [];
        $scope.lineItemSubmissionDisabled = true;
        $scope.systemSelectionDisabled = true;
        $scope.newWorkOrderLog.system = null;
        $scope.newWorkOrderLog.subsystem = null;
      }
    }
  }, true);

}]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderPartsCtrl',
['$scope', function ($scope) {

  // Creates a new part for out parts.html page and directive.
  $scope.emptyWorkOrderPart = function () {
    return {
      WorkOrderId: null,
      PartId: null,
      isFreehandPart: false,
      vendorPartNumber: null,
      description: "",
      quantity: 0,
      cost: 0
    };
  };

  // Initialize the newPart variable with the appropriate data.
  $scope.newWorkOrderPart = $scope.emptyWorkOrderPart();

  // Removes a part from the table on the parts.html page.
  $scope.removePart = function (index) {
    $scope.workorder.workOrderParts.splice(index,1);
  };

  // Adds the current part to the table and empties out the new part form.
  $scope.addNewPart = function () {
    var part = $scope.newWorkOrderPart;
    part.PartId = part.part.id;
    part.description = part.description || part.part.description;
    part.cost = part.cost || part.part.cost;
    $scope.workorder.workOrderParts.push(part);
    $scope.newWorkOrderPart = $scope.emptyWorkOrderPart();
  };

  $scope.$watch('newWorkOrderPart.part', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      if ($scope.newWorkOrderPart.part &&
          ($scope.newWorkOrderPart.part.vendorPartNumber === "Other" ||
           $scope.newWorkOrderPart.isFreehandPart) ) {
        $scope.newWorkOrderPart.isFreehandPart = true;
      } else {
        $scope.newWorkOrderPart.isFreehandPart = false;
      }
    }
  }, true);

}]);

angular.module('WorkOrderApp.Directives')

.directive('customerCallOut', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/customerCallOut.html',
    controller: 'WorkOrderCalloutCtrl',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('generalInformation', [function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: '/app/apps/workorder/views/generalInformation.html',
    controller: 'WorkOrderInformationCtrl'
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('hardware', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/hardware.html',
    link: function (scope, elem, attrs, ctrl, $location) {

    }
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('logs', [function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: '/app/apps/workorder/views/logs.html',
    controller: 'WorkOrderLogsCtrl'
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('parts', [function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: '/app/apps/workorder/views/parts.html',
    controller: 'WorkOrderPartsCtrl'
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('pressure', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/pressure.html',
    link: function (scope, elem, attrs, ctrl, $location) {

    }
  };
}]);

/*!
 * Bootstrap v3.2.0 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.2.0",d.prototype.close=function(b){function c(){f.detach().trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",c).emulateTransitionEnd(150):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.2.0",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),d[e](null==f[b]?this.options[b]:f[b]),setTimeout(a.proxy(function(){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),c.preventDefault()})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b).on("keydown.bs.carousel",a.proxy(this.keydown,this)),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.2.0",c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},c.prototype.keydown=function(a){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.to=function(b){var c=this,d=this.getItemIndex(this.$active=this.$element.find(".item.active"));return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=e[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:g});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,f&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(e)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:g});return a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one("bsTransitionEnd",function(){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger(m)),f&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}}),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b);!e&&f.toggle&&"show"==b&&(b=!b),e||d.data("bs.collapse",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};c.VERSION="3.2.0",c.DEFAULTS={toggle:!0},c.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},c.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var c=a.Event("show.bs.collapse");if(this.$element.trigger(c),!c.isDefaultPrevented()){var d=this.$parent&&this.$parent.find("> .panel > .in");if(d&&d.length){var e=d.data("bs.collapse");if(e&&e.transitioning)return;b.call(d,"hide"),e||d.data("bs.collapse",null)}var f=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[f](0),this.transitioning=1;var g=function(){this.$element.removeClass("collapsing").addClass("collapse in")[f](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return g.call(this);var h=a.camelCase(["scroll",f].join("-"));this.$element.one("bsTransitionEnd",a.proxy(g,this)).emulateTransitionEnd(350)[f](this.$element[0][h])}}},c.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},c.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var d=a.fn.collapse;a.fn.collapse=b,a.fn.collapse.Constructor=c,a.fn.collapse.noConflict=function(){return a.fn.collapse=d,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(c){var d,e=a(this),f=e.attr("data-target")||c.preventDefault()||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""),g=a(f),h=g.data("bs.collapse"),i=h?"toggle":e.data(),j=e.attr("data-parent"),k=j&&a(j);h&&h.transitioning||(k&&k.find('[data-toggle="collapse"][data-parent="'+j+'"]').not(e).addClass("collapsed"),e[g.hasClass("in")?"addClass":"removeClass"]("collapsed")),b.call(g,i)})}(jQuery),+function(a){"use strict";function b(b){b&&3===b.which||(a(e).remove(),a(f).each(function(){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))}))}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.2.0",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function(b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var e=c(d),g=e.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.divider):visible a",i=e.find('[role="menu"]'+h+', [role="listbox"]'+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f+', [role="menu"], [role="listbox"]',g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$backdrop=this.isShown=null,this.scrollbarWidth=0,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.2.0",c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.$body.addClass("modal-open"),this.setScrollbar(),this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(c.$body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one("bsTransitionEnd",function(){c.$element.trigger("focus").trigger(e)}).emulateTransitionEnd(300):c.$element.trigger("focus").trigger(e)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.$body.removeClass("modal-open"),this.resetScrollbar(),this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var c=this,d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=a.support.transition&&d;if(this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),e&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;e?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(150):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var f=function(){c.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",f).emulateTransitionEnd(150):f()}else b&&b()},c.prototype.checkScrollbar=function(){document.body.clientWidth>=window.innerWidth||(this.scrollbarWidth=this.scrollbarWidth||this.measureScrollbar())},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.scrollbarWidth&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right","")},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};c.VERSION="3.2.0",c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(this.options.viewport.selector||this.options.viewport);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var c=a.contains(document.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!c)return;var d=this,e=this.tip(),f=this.getUID(this.type);this.setContent(),e.attr("id",f),this.$element.attr("aria-describedby",f),this.options.animation&&e.addClass("fade");var g="function"==typeof this.options.placement?this.options.placement.call(this,e[0],this.$element[0]):this.options.placement,h=/\s?auto?\s?/i,i=h.test(g);i&&(g=g.replace(h,"")||"top"),e.detach().css({top:0,left:0,display:"block"}).addClass(g).data("bs."+this.type,this),this.options.container?e.appendTo(this.options.container):e.insertAfter(this.$element);var j=this.getPosition(),k=e[0].offsetWidth,l=e[0].offsetHeight;if(i){var m=g,n=this.$element.parent(),o=this.getPosition(n);g="bottom"==g&&j.top+j.height+l-o.scroll>o.height?"top":"top"==g&&j.top-o.scroll-l<0?"bottom":"right"==g&&j.right+k>o.width?"left":"left"==g&&j.left-k<o.left?"right":g,e.removeClass(m).addClass(g)}var p=this.getCalculatedOffset(g,j,k,l);this.applyPlacement(p,g);var q=function(){d.$element.trigger("shown.bs."+d.type),d.hoverState=null};a.support.transition&&this.$tip.hasClass("fade")?e.one("bsTransitionEnd",q).emulateTransitionEnd(150):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top=b.top+g,b.left=b.left+h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=k.left?2*k.left-e+i:2*k.top-f+j,m=k.left?"left":"top",n=k.left?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(l,d[0][n],m)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.removeAttr("aria-describedby"),this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one("bsTransitionEnd",b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName;return a.extend({},"function"==typeof c.getBoundingClientRect?c.getBoundingClientRect():null,{scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop(),width:d?a(window).width():b.outerWidth(),height:d?a(window).height():b.outerHeight()},d?{top:0,left:0}:b.offset())},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.width&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.2.0",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").empty()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},c.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){var e=a.proxy(this.process,this);this.$body=a("body"),this.$scrollElement=a(a(c).is("body")?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",e),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.2.0",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b="offset",c=0;a.isWindow(this.$scrollElement[0])||(b="position",c=this.$scrollElement.scrollTop()),this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight();var d=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+c,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){d.offsets.push(this[0]),d.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.2.0",c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.closest("li"),c),this.activate(g,g.parent(),function(){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},c.prototype.activate=function(b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one("bsTransitionEnd",e).emulateTransitionEnd(150):e(),f.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(c){c.preventDefault(),b.call(a(this),"show")})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.2.0",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=a(document).height(),d=this.$target.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=b-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){null!=this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:b-this.$element.height()-h}))}}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},d.offsetBottom&&(d.offset.bottom=d.offsetBottom),d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}]},{},[1]);
