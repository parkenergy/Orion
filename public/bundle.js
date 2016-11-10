angular.module('CommonControllers', []);
angular.module('CommonComponents', []);
angular.module('CommonDirectives', []);
angular.module('CommonServices', ['ngRoute', 'ngResource', 'ngCookies']);

angular.module('CommonControllers', ['infinite-scroll']).controller('DashboardCtrl',
  ['$scope', '$route', '$location', '$window', '$cookies', 'AlertService', 'LoaderService', '$http', 'Users', 'TimeDisplayService',
    function ($scope, $route, $location, $window, $cookies, AlertService, LoaderService, $http, Users, TimeDisplayService) {

      $scope.loaded = false;
      $scope.reportText = "Time Report";
      $scope.reportDisabled = false;

      $scope.lookup = function (obj) {
        $scope.loaded = false;
        // Function in MyAccount ctrl. load WO with Query obj.
        $scope.WorkOrderLookup(obj).then(
          function (workorders) {
            $scope.workorders = workorders.map(mapWorkorders);
            $scope.loaded = true;
            $scope.spinnerOff();
          },
          function (reason){
            console.log("Failure: ", reason);
          }
        )
      };

      $scope.orderByField = 'epoch';
      $scope.reverseSort = true;
      $scope.unitNumber = null;
      $scope.techName = null;
      $scope.leaseName = null;
      $scope.customerName = null;
      $scope.billable = null;
      $scope.billParts = null;
      $scope.unapproved = false;
      $scope.approved = false;
      $scope.synced = false;
      $scope.limit = 50;
      $scope.skip = 0;

      $scope.pad = TimeDisplayService.pad;

      if($cookies.get('role') === "admin"){
        $scope.approved = true;
      }
      if($cookies.get('role') === "manager"){
        $scope.unapproved = true;
      }

      $scope.loadOnScroll = function () {
        console.log("Scrolling..");
        $scope.skip += $scope.limit;

        var query = {
          limit: $scope.limit,
          skip: $scope.skip
        };

        if($scope.dates.from && $scope.dates.to) {
          query.from = encodeURIComponent($scope.dates.from.toISOString());
          query.to = encodeURIComponent($scope.dates.to.toISOString());
        }
        if($scope.unitNumber) {
          query.unit = $scope.unitNumber;
        }
        if($scope.techName) {
          query.tech = $scope.techName;
        }
        if($scope.leaseName) {
          query.loc = $scope.leaseName;
        }
        if($scope.customerName) {
          query.cust = $scope.customerName;
        }
        if($scope.billable) {
          query.billable = $scope.billable;
        }
        if($scope.billParts) {
          query.billParts = $scope.billParts;
        }
        if($scope.unapproved){
          query.unapproved = $scope.unapproved;
        }
        if($scope.approved){
          query.approved = $scope.approved;
        }
        if($scope.synced){
          query.synced = $scope.synced;
        }

        $scope.WorkOrderLookup(query).then(
          function (workorders) {
            var wo =  workorders.map(mapWorkorders);
            $scope.workorders = $scope.workorders.concat(wo);
          },
          function (reason){
            console.log("Failure: ", reason);
          }
        )
      };

      $scope.dates = {
        from: null,
        to: null
      };

      //ensure from date is always beginning of day
      $scope.startOfDay = function () {
        $scope.dates.from = new Date(
          $scope.dates.from.setHours(0,0,0,0)
        );
      };

      //ensure to date is always end of day
      $scope.endOfDay = function () {
        $scope.dates.to = new Date(
          $scope.dates.to.setHours(23,59,59,999)
        );
      };

      $scope.submit = function () {
        $scope.limit = 50;
        $scope.skip = 0;

        var query = {
          limit: $scope.limit,
          skip: $scope.skip
        };

        /* Used?
        if($scope.techsSupervised) {
          query.supervised = $scope.techsSupervised;
        }*/

        if($scope.dates.from && $scope.dates.to) {
          query.from = encodeURIComponent($scope.dates.from.toISOString());
          query.to = encodeURIComponent($scope.dates.to.toISOString());
        }
        if($scope.unitNumber) {
          query.unit = $scope.unitNumber;
        }
        if($scope.techName) {
          $scope.techName = $scope.techName.toUpperCase();
          query.tech = $scope.techName;
        }
        if($scope.leaseName) {
          query.loc = $scope.leaseName;
        }
        if($scope.customerName) {
          query.cust = $scope.customerName;
        }
        if($scope.billable) {
          query.billable = $scope.billable
        }
        if($scope.billParts) {
          query.billParts = $scope.billParts
        }
        if($scope.unapproved){
          query.unapproved = $scope.unapproved;
        }
        if($scope.approved){
          query.approved = $scope.approved;
        }
        if($scope.synced){
          query.synced = $scope.synced;
        }
        $scope.lookup(query);
      };

      $scope.report = function () {
        $scope.reportText = "Loading...";
        $scope.reportDisabled = true;

        var query = {
          limit: $scope.limit.toString(),
          skip: $scope.skip.toString()
        };

        if($scope.dates.from && $scope.dates.to) {
          query.from = encodeURIComponent($scope.dates.from.toISOString());
          query.to = encodeURIComponent($scope.dates.to.toISOString());
        }
        if($scope.unitNumber) {
          query.unit = $scope.unitNumber.toString();
        }
        if($scope.techName) {
          var TechName = $scope.techName.toUpperCase();
          query.tech = TechName;
        }
        if($scope.leaseName) {
          query.loc = $scope.leaseName.toString();
        }
        if($scope.customerName) {
          query.cust = $scope.customerName.toString();
        }

        query.report = 'true';

        console.log(query);
        $http({method: 'GET',url: '/api/workorders', params: query})
          .then(function (resp) {
            var anchor = angular.element('<a/>');
            anchor.attr({
              href: 'data:attachment/csv;charset=utf-8,' + encodeURI(resp.data),
              target: '_blank',
              download: 'timeReport.csv'
            })[0].click();
            $scope.reportText = "Time Report";
            $scope.reportDisabled = false;
          }, function () {
            AlertService.add("danger", "Time Report failed", 2000)
            $scope.reportText = "Time Report";
            $scope.reportDisabled = false;
          });
      };

      $scope.createWorkOrder = function () {
        $location.path('/workorder/create');
      };

      $scope.resort = function (by) {
        $scope.orderByField = by;
        $scope.reverseSort = !$scope.reverseSort;
        //console.log($scope.orderByField);
        //console.log($scope.reverseSort);
      };

      $scope.clickWorkOrder = function () {
        $window.open('#/workorder/review/' + this.workorder._id);
      };

      $scope.redirectToReview = function (id){
        $location.url('http://localhost:3000/#/workorder/review/' + id);
      };

      $scope.pad = TimeDisplayService.pad;

      // $scope.changeSorting = function (column) {
      //   var sort = $scope.sort;
      //   if (sort.column == column) {
      //     sort.descending = !sort.descending;
      //   } else {
      //     sort.column = column;
      //     sort.descending = false;
      //   }
      // };

      $scope.submit();

    }]);

//Set fields and sanity checks
function mapWorkorders(wo){
  if(wo.unitNumber) wo.unitSort = Number(wo.unitNumber.replace(/\D+/g, ''));
  else wo.unitSort = 0;

  if(wo.technician) wo.techName = wo.technician.firstName + ' ' + wo.technician.lastName;
  else wo.techName = wo.techId;

  if(wo.header) {
    if (!wo.header.customerName) wo.header.customerName = '';
    wo.customerName = wo.header.customerName;
    wo.locationName = wo.header.leaseName;
  }
  else {
    wo.customerName = '';
    wo.locationName = '';
  }

  wo.epoch = new Date(wo.timeStarted).getTime();
  wo.totalMinutes = (wo.totalWoTime.hours * 60) + wo.totalWoTime.minutes;
  var displayName = "";
  if (!wo.unit || !wo.unit.location || !wo.unit.location.name) {
    // do nothing
  } else if (wo.unit.location.name.length <= 20) {
    wo.displayLocationName = wo.unit.location.name;
  } else {
    wo.displayLocationName = wo.unit.location.name.slice(0,17) + "...";
  }
  return wo;
}

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

function clearSearch() {

  var elements = [] ;
  elements = document.getElementsByClassName("search");

  for(var i=0; i<elements.length ; i++){
    elements[i].value = "" ;
  }

}

angular.module('CommonControllers').controller('ExampleCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
	function ($scope, $route, $location, AlertService, LoaderService) {

	$scope.title = "Example";
	$scope.message = "this page shows how to build this app";

	$scope.model = {}; // standard model wrapper

	$scope.list = [{id: 1, text: 'a'}, {id: 2, text: 'b'}, {id: 3, text: 'c'}];
	$scope.hours = [0,1,2,3,4,5,6,7,8,9,10,11,12];
	$scope.minutes = [0,15,30,45];
	$scope.model.timeField = { hours: 0, minutes: 0 };

	/* Watch an element for change event
	--------------------------------------------------------------------------- */
	$scope.$watch('model.textField', function (newval, oldval) {
		console.log(newval);
	});

	$scope.$watch('model.isChecked', function (newval, oldval) {
		console.log(newval);
	});

	/* Table
	--------------------------------------------------------------------------- */
  $scope.superTableModel = {
    tableName: "Example Super Table", // displayed at top of page
    objectList: getObjects(), // objects to be shown in list
    displayColumns: getTableDisplayColumns(),
		rowClickAction: rowClickAction, // takes a function that accepts an obj param
    rowButtons: getTableRowButtons(), // an array of button object (format below)
    headerButtons: getTableHeaderButtons(), // an array of button object (format below)
		sort: {
			column: ["field1", "field2"], // takes an array for secondary sort
			descending: [false, true] // takes an array for secondary sort
		}
  };

	function getObjects () {
		var arr = [];
		var letters = ['a','b','c','d','e','f','g','h','i','j'];
		var i = 0;
		while(i < 10) {
			var obj = {
				_id: i, // we arent going to display this
				field1: letters[i],
				field2: letters[9-i],
				field3: i,
				field4: 10-i
			};
			arr.push(obj);
			i++;
		}
		return arr;
	}

  function getTableDisplayColumns () {
    return [ // which columns need to be displayed in the table
      { title: "Field 1", objKey: "field1" },
      { title: "Field 2", objKey: "field2" },
      { title: "Field 3", objKey: "field3" },
      { title: "Field 4", objKey: "field4" },
    ];
  }

  function rowClickAction (obj) { // takes the row object
    /* Example
		----------------------------------------------------------------------------
		if (role === "admin")
			$scope.editObj(obj._id);
		else
			$scope.viewObj(obj._id);
		------------------------------------------------------------------------- */
		alert("you clicked on " + obj._id);
  }

  function getTableRowButtons () {
    var arr = [];
    var button = {};
    button.title = "edit";
    button.action = rowClickAction;
    arr.push(button);
    return arr;
  }

  function tableHeaderAction () { // takes no parameters
    /* Example
		----------------------------------------------------------------------------
		if (role === "admin")
			$scope.create();
		else
			$scope.create();
		------------------------------------------------------------------------- */
		alert("you clicked on the header ");
  }

  function getTableHeaderButtons() {
    var arr = [];
    var button = {};
    button.title = "new part";
    button.action = tableHeaderAction;
    arr.push(button);
    return arr;
  }



	$scope.navigateSomewhere = function () {
		$location.path('/myaccount');
	};

	$scope.infoAlert = function () {
		AlertService.add("info", "This is an info alert!", 1000); // specified timeout
	};

	$scope.warningAlert = function () {
		AlertService.add("warning", "This is an warning alert!"); // default timeout (5000)
	};

	$scope.dangerAlert = function () {
		AlertService.add("danger", "This is a danger alert!");
	};



}]);

angular.module('CommonControllers').controller('HomepageCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
	function ($scope, $route, $location, AlertService, LoaderService) {

		$scope.title = "Park Energy";
		$scope.message = "field asset management";

		$scope.myAccount = function () {
			$location.path('/myaccount');
		};

}]);

angular.module('CommonControllers').controller('MyAccountCtrl',
['$scope', '$route', '$location', '$q', '$cookies', 'AlertService', 'LoaderService', 'WorkOrders',
  function ($scope, $route, $location, $q, $cookies, AlertService, LoaderService, WorkOrders) {

    $scope.title = "My Account";
    $scope.spinner = true;
    $scope.spinnerOff = function (){
      $scope.spinner = false;
    };
    $scope.WorkOrderLookup = function (obj) {
      var deferred = $q.defer();
      console.log("Loading workorders...");
      WorkOrders.query(obj,
        function (response) {
          console.log("Workorders loaded");
          return deferred.resolve(response);
        },
        function (err) { return deferred.reject(err); }
      );
      return deferred.promise;
    };

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

}]);

angular.module('CommonControllers').controller('NSTCtrl',
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
      $scope.objectList.forEach(function (ele, ind, arr) {

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

angular.module('CommonControllers').controller('SessionCtrl',
['$scope', '$http', '$location', '$routeParams', '$window', '$cookies', 'AlertService', 'Users', '$auth',
function ($scope, $http, $location, $routeParams, $window, $cookies, AlertService, Users, $auth) {

  $cookies.put('tech', "Logged Out");
  $scope.hideLocalLogin = false;
  $scope.title = "Login";
  $scope.message = "Use your local login to access the system.";

	$scope.returnUrl = $routeParams.returnUrl;
	$scope.fragment = $routeParams.fragment;
	$location.search({});

  if($routeParams.failure === "true") {
    AlertService.add("info", "We were unable to log you in. Please try again.");
  }

  $scope.localLogin = function () {
    console.log("localLogin");
    $scope.username = $scope.username.toUpperCase();
    console.log($scope.username);
    AlertService.add("info", "Login Successful!", 1000);
    $location.path($scope.fragment || "myaccount");
	};

  $scope.authenticate = function(provider) {
    console.log("authenticate called");
    $auth.authenticate(provider)
      .then(function () {
        $http.get('/api/identify')
          .then(function (res) {
            console.log("Authed as: ", res.data.username);
            $cookies.put('tech', res.data.username || "Logged Out");
            $cookies.put('role', res.data.role);
            $location.path('myaccount');
          }, function (res) {
            AlertService.add("danger", res, 1000);
          });
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

angular.module('CommonControllers').controller('SuperIndexCtrl',
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
    return { column: [key], descending: [false] };
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

angular.module('CommonDirectives')

.directive('alerts', ['AlertService', function (AlertService) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/alerts.html',
    link: function (scope, elem, attrs, ctrl) {
      scope.closeAlert = function (obj) {
      	return AlertService.closeAlert(obj);
      };
  	}
  };
}]);

angular.module('CommonDirectives')
.directive('customValidation', function () {
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
        var isNonNegative = attr.nonNegative === "true";
        var isIntegerOnly = attr.integerOnly === "true";
        console.log(attr.integerOnly);

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

angular.module('CommonDirectives')

.directive('dashboard', ['$window', '$location', 'WorkOrders', function ($window, $location, WorkOrders) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/dashboard.html',
    controller: "DashboardCtrl",
    scope: true
  };
}]);

angular.module('CommonDirectives')

.directive('header', ['$window', '$location', '$cookies', function ($window, $location, $cookies) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      function getnavItems() {
        return [
          {
          text: "User: " + $cookies.get('tech') || "Logged Out",
          action: function () { $location.path('/support'); }
          }
        ];
      }

      scope.navItems = getnavItems();
  	}
  };
}]);

angular.module('CommonDirectives')

.directive('nestedSupertable', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      model: '='
    },
    controller: 'NSTCtrl',
    templateUrl: '/lib/public/angular/views/nestedSuperTable.html'
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

/**
 * This service handles server side error responses for the whole app.
 * If a route has needsLogin: true, this will ensure the user is logged in.
 */

angular.module('CommonServices')
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

    if ($cookies.get('userId') !== null &&
        $cookies.get('userId') !== undefined &&
        $cookies.get('userId') !== 0 &&
        $cookies.get('userId') !== "undefined") {
          deferred.resolve($cookies.get('userId'));
    } else {

      httpService.get('/authorized').success(function (user) {
        if (user !== '0' && user !== undefined && user !== null && user !== "undefined") {
          $cookies.put('userId', user._id);
          $cookies.put('userName', user.userName);
          deferred.resolve($cookies.get('userId'));
        } else {
          $cookies.remove('userId');
          $cookies.remove('user');
          deferred.reject("Unauthorized");
        }
      }).error(function (err) {
        $cookies.remove('userId');
        $cookies.remove('user');
        deferred.reject(err);
      });

    }

    return deferred.promise;

  }

  return {

    // Cool hax, bro.
    // Inject $http and $route to get around circular dependencies.
    // On each request, we want to check the user's cookie is set.
    request: function (config) {
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

    requestError: function (rejection) {
      logInAgain();
      return $q.reject(rejection);
    },

    response: function (response) {
      return response || $q.when(response);
    },

    // If the user is not logged in on the server side,
    // we're returning a 401 error code, so this will catch that.
    responseError: function (rejection) {
      if (rejection.status === 401) { logInAgain(); }
      return $q.reject(rejection);
    }
  };
}]);

angular.module('CommonServices')
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

/**
 *            GeneralPartSearchService
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonServices')
.factory('GeneralPartSearchService', [function () {
  var GeneralPartSearchService = {};

  // Replace the General population of search field on all apps that use it.
  GeneralPartSearchService.mapParts = function (Parts) {
    return Parts.map(function (part) {
      part.searchStr = [part.description, part.componentName, part.MPN].join(' ');
      return part;
    });
  };

  GeneralPartSearchService.partTableModel = function (Parts, type, data) {
    return {
      tableName: "Search For Parts", // displayed at top of page
      objectList: GeneralPartSearchService.mapParts(Parts), // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        { title: "Part #", objKey: "componentName" },
        { title: "MPN", objKey: "MPN" },
        { title: "Description", objKey: "description" }
      ],
      rowClickAction: GeneralPartSearchService.addPart(type, data),
      rowButtons: null,
      headerButtons: null, // an array of button object (format below)
      sort: { column: ["number"], descending: false }
    }
  };

  GeneralPartSearchService.addPart = function (type, data) {
    if ( type === 'replace' ) {
      return function addPart (part) {
        data.part = {
          vendor:       part.vendor,
          number:       part.number,
          description:  part.description,
          smartPart:    part.componentName,
          quantity:     0,
          isManual:     false,
          isBillable:   false,
          isWarranty:   false,
          netsuiteId:   part.netsuiteId
        };
      }
    }
    if ( type === 'push' ) {
      return function addPart (part) {
        data.parts.push({
          vendor:         part.vendor,
          number:         part.number,
          smartPart:      part.componentName,
          description:    part.description,
          quantity:       0,
          isBillable:     false,
          isWarranty:     false,
          isManual:       false,
          netsuiteId:     part.netsuiteId
        });
      }
    }
    if ( type === 'wo' ) {
      return function addPart (part) {
        data.parts.push({
          vendor:         part.vendor,
          number:         part.number,
          smartPart:      part.componentName,
          description:    part.description,
          quantity:       0,
          cost:           0,
          laborCode:      "",
          isBillable:     false,
          isWarranty:     false,
          isManual:       false,
          netsuiteId:     part.netsuiteId
        });
      }
    }
  };

  return GeneralPartSearchService;
}]);

angular.module('CommonServices')
.factory('LoaderService', ['$rootScope', function ($rootScope) {

  var LoaderService = {};
  $rootScope.showLoader = false;

  LoaderService.show = function () {
    $rootScope.showLoader = true;
  };

  LoaderService.hide = function () {
    $rootScope.showLoader = false;
  };

  return LoaderService;

}]);

/**
 *            LocationItemService
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonServices')
.factory('LocationItemService',[function () {
  var LocationItemService = {};

  // get all info from the truck ID itself ----------------------------
  LocationItemService.getTruckInfo = function (truckId, locations) {
    // relate truckID to location NSID
    var Truck = function () {
      return {
        truckId: '',
        netsuiteId: '',
        _id: null
      };
    };
    var thisTruck = Truck();
    _.map(locations,function(obj){
      if(obj.name.indexOf(":") != -1){
        if(obj.name.substr(obj.name.indexOf(":") + 1).trim() === truckId){
          // return all info of that truckID
          thisTruck._id = obj._id;
          thisTruck.truckId = truckId;
          thisTruck.netsuiteId = obj.netsuiteId;
        }
      }
    });
    return thisTruck;
  };
  // -------------------------------------------------------------------

  // get the NSID back from a locations based on ID --------------------
  LocationItemService.getLocationNSID = function (id, locations) {
    for (var i = 0; i < locations.length; i++) {
      if (locations[i]._id === id) {
        return locations[i].netsuitId;
      }
    }
    return null;
  };
  // -------------------------------------------------------------------

  // return Array of location names and user truck ID ------------------
  // only warehouses and this users truck id.
  LocationItemService.getLocationNameArray = function (truckId, locations) {
    function ClassLocations () { return { name: ''}; }
    var defaultLocation = ClassLocations();
    var returnedArray = [];

    // fill the rest of the array with the other warehouse IDs
    _.map(locations, function (obj) {
      if ( obj.name.indexOf(":") === -1 ) {
        var thisLocation = ClassLocations();
        thisLocation.name = obj.name;
        returnedArray.push(thisLocation);
      }
    });

    // set default as the user's truck id
    defaultLocation.name = truckId;
    returnedArray.unshift(defaultLocation);

    return returnedArray;
  };
  // -------------------------------------------------------------------

  // return Array of location Ids, name, and netsuite Id ---------------
  // only for warehouses and this users truck Id
  LocationItemService.getLocationTechWarehouseObjArray = function (truckId, locations) {
    function ClassLocation () {
      return {
        name: '',
        netsuiteId: '',
        _id: null
      }
    }

    var defaultLocation = ClassLocation();
    var thisTruck = LocationItemService.getTruckInfo(truckId, locations);
    var returnedArray = [];

    // fill the rest of the array with the other warehouse info
    _.map(locations, function (obj) {
      if ( obj.name.indexOf(":") === -1 ) {
        var thisLocation = ClassLocation();
        thisLocation.name = obj.name;
        thisLocation.netsuiteId = obj.netsuiteId;
        thisLocation._id = obj._id;
        returnedArray.push(thisLocation);
      }
    });
    // set default as the user's truck id
    defaultLocation.name = truckId;
    defaultLocation._id = thisTruck._id;
    defaultLocation.netsuiteId = thisTruck.netsuiteId;
    returnedArray.unshift(defaultLocation);

    return returnedArray;
  };
  // -------------------------------------------------------------------

  return LocationItemService;
}]);

angular.module('CommonServices')
.factory('RedirectService', ['$location', function ($location) {

  var RedirectService = {};

  RedirectService.getEditRedirectFn = function (model) {
    return function (obj) {
      var id = obj ? obj._id : undefined;
      $location.path("/" + model + "/edit/" + (id || ""));
    };
  };

  RedirectService.getIndexRedirectFn = function (model) {
    return function () { $location.path("/" + model); };
  };

  return RedirectService;

}]);

angular.module('CommonServices')
.factory('TimeDisplayService',[function(){

    var TimeDisplayService = {};
     // improved badding for more that 2 digits
      TimeDisplayService.pad = function (n) {
        if (n >= 0) {
          return n > 9 ? "" + n : "0" + n;
        } else {
          return n < -9 ? "" + n : "-0" + Math.abs(n);
        }
      }
      // Padder for more exact padding.
      TimeDisplayService.exactPad =  function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      };
      // Convert HH:-MM / -H:-M / -H:MM  to correct time intervals examples below
      TimeDisplayService.timeManager = function (h, m) {
        var HtoM = 0;
        var totalM = 0;
        // Initual Checks
        if ((m < 0) && (h === 0)) {    // IE: 0:-15  = -00:15 *
          return { hours: "-0" + h, minutes: TimeDisplayService.pad(Math.abs(m)) };
        } else if ((m < 0) && (h < 0)) {// IE: -4:-30 = -04:30 *
          return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(Math.abs(m)) };
        } else if ((m > 0) && (h === 0)) {
          return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(m) };
          // Recursive calls
        } else if ((m > 0) && (h < 0)) {// IE: -1:+30 = -00:30 *
          HtoM = Math.abs(Math.round(h * 60));
          totalM = m - HtoM;
          // Deal with negative times
          if (totalM > 0) { 
            h = ((totalM / 60) < 1) ? 0 : Math.round(totalM / 60);
          } else {
            h = parseInt(totalM / 60);
          }
          m = Math.round(totalM % 60);
          return TimeDisplayService.timeManager(h, m); // recursion
        } else if ((m < 0) && (h > 0)) {// IE: 1:-30 = 00:30 *
          HtoM = Math.abs(Math.round(h * 60));
          totalM = HtoM + m;
          h = ((totalM / 60) < 1) ? 0 : Math.floor(totalM / 60);
          m = Math.round(totalM % 60);
          return TimeDisplayService.timeManager(h, m); // recursion
        }
        return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(m) };
      };

    return TimeDisplayService;
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

angular.module('CommonServices')

.factory('ApplicationTypes', ['$resource', function ($resource) {
  return $resource('/api/applicationtypes/:id', {id: '@id'});
}])

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

.factory('InventoryTransfers', ['$resource', function ($resource) {
  return $resource('/api/inventorytransfers/:id', {id: '@id'});
}])

.factory('Jsas', ['$resource', function ($resource) {
  return $resource('/api/jsas/:id', {id: '@id'});
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

.factory('Transfers', ['$resource', function ($resource) {
  return $resource('/api/transfers/:id', {id: '@id'});
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

.factory('ReviewNotes', ['$resource', function($resource){
  return $resource('/api/reviewnotes/:id', {id: '@id'});
}])

.factory('EditHistories', ['$resource', function($resource){
  return $resource('/api/edithistories/:id', {id: '@id'});
}])

.factory('WorkOrders', ['$resource', function ($resource) {
  return $resource('/api/workorders/:id', {
    id: '@id'
  }, {
    update: {
      method: 'PUT',
      params: {id: '@id'}
    }
  });
}]);


angular.module('CommonServices')
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

angular.module('CommonControllers').controller('SuperTableCtrl',
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
        console.log("See super-table documentation for more info.");
        var errMessage =  "SuperTabelCtrl: " +
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

angular.module('CompressorApp.Controllers', []);
angular.module('CompressorApp.Directives', []);
angular.module('CompressorApp.Services', ['ngResource', 'ngCookies']);

angular.module('CompressorApp', [
  'CompressorApp.Controllers',
  'CompressorApp.Directives',
  'CompressorApp.Services',
]);


angular.module('CompressorApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/compressor/edit/:id?', {
    controller: 'CompressorEditCtrl',
    templateUrl: '/lib/public/angular/apps/compressor/views/edit.html',
    resolve: {
      compressor: function ($route, $q, Compressors) {
        //determine if we're creating or editing a compressor.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Compressors.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/compressor', {
    controller: 'CompressorIndexCtrl',
    templateUrl: '/lib/public/angular/apps/compressor/views/index.html',
    resolve: {
      compressors: function ($route, $q, Compressors) {
        var deferred = $q.defer();
        Compressors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('CountyApp.Controllers', []);
angular.module('CountyApp.Directives', []);
angular.module('CountyApp.Services', ['ngResource', 'ngCookies']);

angular.module('CountyApp', [
  'CountyApp.Controllers',
  'CountyApp.Directives',
  'CountyApp.Services',
]);


angular.module('CountyApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/county/edit/:id?', {
    controller: 'CountyEditCtrl',
    templateUrl: '/lib/public/angular/apps/county/views/edit.html',
    resolve: {
      county: function ($route, $q, Counties) {
        //determine if we're creating or editing a county.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Counties.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      states: function ($route, $q, States) {
        var deferred = $q.defer();
        States.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/county', {
    controller: 'CountyIndexCtrl',
    templateUrl: '/lib/public/angular/apps/county/views/index.html',
    resolve: {
      counties: function ($route, $q, Counties) {
        var deferred = $q.defer();
        Counties.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('AreaApp.Controllers', []);
angular.module('AreaApp.Directives', []);
angular.module('AreaApp.Services', ['ngResource', 'ngCookies']);

angular.module('AreaApp', [
  'AreaApp.Controllers',
  'AreaApp.Directives',
  'AreaApp.Services',
]);


angular.module('AreaApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/area/edit/:id?', {
    controller: 'AreaEditCtrl',
    templateUrl: '/lib/public/angular/apps/area/views/edit.html',
    resolve: {
      area: function ($route, $q, Areas) {
        //determine if we're creating or editing a area.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Areas.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/area', {
    controller: 'AreaIndexCtrl',
    templateUrl: '/lib/public/angular/apps/area/views/index.html',
    resolve: {
      areas: function ($route, $q, Areas) {
        var deferred = $q.defer();
        Areas.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('InventoryTransferApp.Controllers', []);
angular.module('InventoryTransferApp.Directives', []);
angular.module('InventoryTransferApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('InventoryTransferApp', [
  'InventoryTransferApp.Controllers',
  'InventoryTransferApp.Directives',
  'InventoryTransferApp.Services',
]);

angular.module('InventoryTransferApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/inventorytransfer/edit/:id?', {
    needsLogin: true,
    controller: 'InventoryTransferEditCtrl',
    templateUrl: '/lib/public/angular/apps/inventorytransfer/views/edit.html',
    resolve: {
      inventorytransfer: function ($route, $q, InventoryTransfers) {
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          InventoryTransfers.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }
        else { return null; }
      },
      parts: function ($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) {return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      users: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      locations: function ($route, $q, Locations){
        var deferred = $q.defer();
        Locations.query({},
          function (response){ return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })
  .when('/inventorytransfer', {
    needsLogin: true,
    controller: 'InventoryTransferIndexCtrl',
    templateUrl: '/lib/public/angular/apps/inventorytransfer/views/index.html',
    resolve: {
      inventorytransfers: function ($route, $q, InventoryTransfers) {
        var deferred = $q.defer();
        InventoryTransfers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('InventoryTransferApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
  var original = $location.path;
  $location.path = function (path, reload) {
    if ( reload === false ) {
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function () {
        $route.current = lastRoute;
        un();
      });
    }
    return original.apply($location, [path]);
  };
}]);

angular.module('EngineApp.Controllers', []);
angular.module('EngineApp.Directives', []);
angular.module('EngineApp.Services', ['ngResource', 'ngCookies']);

angular.module('EngineApp', [
  'EngineApp.Controllers',
  'EngineApp.Directives',
  'EngineApp.Services',
]);


angular.module('EngineApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/engine/edit/:id?', {
    controller: 'EngineEditCtrl',
    templateUrl: '/lib/public/angular/apps/engine/views/edit.html',
    resolve: {
      engine: function ($route, $q, Engines) {
        //determine if we're creating or editing a engine.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Engines.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/engine', {
    controller: 'EngineIndexCtrl',
    templateUrl: '/lib/public/angular/apps/engine/views/index.html',
    resolve: {
      engines: function ($route, $q, Engines) {
        var deferred = $q.defer();
        Engines.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
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
    templateUrl: '/lib/public/angular/apps/location/views/edit.html',
    resolve: {
      location: function ($route, $q, Locations) {
        //determine if we're creating or editing a location.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Locations.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      customers: function ($route, $q, Customers) {
        var deferred = $q.defer();
        Customers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      areas: function ($route, $q, Areas) {
        var deferred = $q.defer();
        Areas.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      states: function ($route, $q, States) {
        var deferred = $q.defer();
        States.query({sort: "name"},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      counties: function ($route, $q, Counties) {
        var deferred = $q.defer();
        Counties.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/location', {
    controller: 'LocationIndexCtrl',
    templateUrl: '/lib/public/angular/apps/location/views/index.html',
    resolve: {
      locations: function ($route, $q, Locations) {
        var deferred = $q.defer();
        Locations.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
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
    templateUrl: '/lib/public/angular/apps/part/views/edit.html',
    resolve: {
      part: function ($route, $q, Parts) {
        //determine if we're creating or editing a part.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Parts.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      vendors: function ($route, $q, Vendors) {
        var deferred = $q.defer();
        Vendors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/part', {
    controller: 'PartIndexCtrl',
    templateUrl: '/lib/public/angular/apps/part/views/index.html',
    resolve: {
      parts: function ($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  });
}]);

/**
 *            app
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers', []);
angular.module('PartOrderApp.Components', []);
angular.module('PartOrderApp.Directives', []);
angular.module('PartOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('PartOrderApp', [
  'PartOrderApp.Controllers',
  'PartOrderApp.Components',
  'PartOrderApp.Directives',
  'PartOrderApp.Services'
]);

angular.module('PartOrderApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider

    .when('/partorder', {
      needsLogin: true,
      controller: 'PartOrderCtrl',
      templateUrl: '/lib/public/angular/apps/partorder/views/poOverview.html',
      resolve: {
        /*partorders: function($route, $q, PartOrders){
         var deferred = $q.defer();
         PartOrders.query({},
         function (response){ return deferred.resolve(response); },
         function (err) { return deferred.reject(err); }
         );
         return deferred.promise;
         }*/
      }
    })
    .when('/partorder/review/:id',{
      needsLogin: true,
      controller: 'PartOrderReviewCtrl',
      templateUrl: '/lib/public/angular/apps/partorder/views/poReview.html',
      resolve: {
        /*partorder: function ($route, $q, PartOrders) {
         var id = $route.current.params.id || 0;
         var deferred = $q.defer();
         if (id) {
         PartOrders.get({id: id},
         function (response) { return deferred.resolve(response); },
         function (err) { return deferred.reject(err); });
         } else { return null; }
         return deferred.promise;
         }*/
      }
    })
    .when('/partorder/create',{
      needsLogin: true,
      controller: 'PartOrderCreateCtrl',
      templateUrl: '/lib/public/angular/apps/partorder/views/poCreate.html',
      resolve: {
        /*partorders: function($route, $q, PartOrders){
         var deferred = $q.defer();
         PartOrders.query({},
         function (response){ return deferred.resolve(response); },
         function (err) { return deferred.reject(err); }
         );
         return deferred.promise;
         },*/
        parts: function ($route, $q, Parts) {
          var deferred = $q.defer();
          Parts.query({},
            function (response){ return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        },
        locations: function($route, $q, Locations){
          var deferred = $q.defer();
          Locations.query({},
            function (response){ return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }
      }
    })
  }
]);

angular.module('PartOrderApp')
.run(['$route', '$rootScope', '$location',
  function($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function(path, reload) {
      if (reload === false) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function() {
          $route.current = lastRoute;
          un();
        });
      }
      return original.apply($location, [path]);
    };
  }
]);


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
    templateUrl: '/lib/public/angular/apps/customer/views/edit.html',
    resolve: {
      customer: function ($route, $q, Customers) {
        //determine if we're creating or editing a customer.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Customers.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      locations: function ($route, $q, Locations) {
        //determine if we're creating or editing a customer.
        //if editing show the locations; otherwise, nothing.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Locations.query({where: {CustomerId: id}},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/customer', {
    controller: 'CustomerIndexCtrl',
    templateUrl: '/lib/public/angular/apps/customer/views/index.html',
    resolve: {
      customers: function ($route, $q, Customers) {
        var deferred = $q.defer();
        Customers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
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
    templateUrl: '/lib/public/angular/apps/servicepartner/views/edit.html',
    resolve: {
      servicePartner: function ($route, $q, ServicePartners) {
        //determine if we're creating or editing a servicePartner.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          ServicePartners.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/servicepartner', {
    controller: 'ServicePartnerIndexCtrl',
    templateUrl: '/lib/public/angular/apps/servicepartner/views/index.html',
    resolve: {
      servicePartners: function ($route, $q, ServicePartners) {
        var deferred = $q.defer();
        ServicePartners.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('SupportApp.Controllers', []);
angular.module('SupportApp.Directives', []);
angular.module('SupportApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('SupportApp', [
  'SupportApp.Controllers',
  'SupportApp.Directives',
  'SupportApp.Services',
]);

angular.module('SupportApp').config(['$routeProvider',
  function ($routeProvider){
  $routeProvider
  .when('/support', {
    needsLogin: true,
    controller: 'SupportIndexCtrl',
    templateUrl: '/lib/public/angular/apps/support/views/index.html',
    resolve:{
      me: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.get({id: 'me'},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('SupportApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
  var original = $location.path;
  $location.path = function (path, reload) {
    if (reload === false) {
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function () {
          $route.current = lastRoute;
          un();
      });
    }
    return original.apply($location, [path]);
  };
}]);

angular.module('TransferApp.Controllers', []);
angular.module('TransferApp.Directives', []);
angular.module('TransferApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

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
    templateUrl: '/lib/public/angular/apps/transfer/views/edit.html',
    resolve: {
      transfer: function ($route, $q, Transfers) {
        //determine if we're creating or editing a transfer.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Transfers.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }
        else { return null; }
      },
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) {return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      customers: function ($route, $q, Customers) {
        var deferred = $q.defer();
        Customers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      users: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      counties: function ($route, $q, Counties) {
        var deferred = $q.defer();
        Counties.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      states: function ($route, $q, States) {
        var deferred = $q.defer();
        States.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })
  .when('/transfer', {
    needsLogin: true,
    controller: 'TransferIndexCtrl',
    templateUrl: '/lib/public/angular/apps/transfer/views/index.html',
    resolve: {
      transfers: function ($route, $q, Transfers) {
        var deferred = $q.defer();
        Transfers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('TransferApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
  var original = $location.path;
  $location.path = function (path, reload) {
    if (reload === false) {
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function () {
          $route.current = lastRoute;
          un();
      });
    }
    return original.apply($location, [path]);
  };
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
    templateUrl: '/lib/public/angular/apps/unit/views/edit.html',
    resolve: {
      unit: function ($route, $q, Units) {
        //determine if we're creating or editing a unit.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Units.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      servicePartners: function ($route, $q, ServicePartners) {
        var deferred = $q.defer();
        ServicePartners.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/unit', {
    controller: 'UnitIndexCtrl',
    templateUrl: '/lib/public/angular/apps/unit/views/index.html',
    resolve: {
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
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
    templateUrl: '/lib/public/angular/apps/user/views/edit.html',
    resolve: {
      user: function ($route, $q, Users) {
        //determine if we're creating or editing a user.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Users.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      servicePartners: function ($route, $q, ServicePartners) {
        var deferred = $q.defer();
        ServicePartners.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/user', {
    controller: 'SuperIndexCtrl',
    templateUrl: '/lib/public/angular/views/superIndex.html',
    resolve: {
      // Required Attributes for SuperIndex
      title: function () { return "Users"; },
      model: function () { return "user"; },
      objectList: function ($route, $q, Users) {
        var deferred = $q.defer();
        var select = ['id', 'firstName', 'lastName', 'username'];
        Users.query({attributes: select},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      displayColumns: function () {
        return [
          { title: "First Name", objKey: 'firstName' },
          { title: "Last Name", objKey: 'lastName' },
          { title: "Username", objKey: 'username' }
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
    templateUrl: '/lib/public/angular/apps/vendorpart/views/edit.html',
    resolve: {
      vendorpart: function ($route, $q, VendorParts) {
        //determine if we're creating or editing a vendorpart.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          VendorParts.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      parts: function ($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      vendors: function ($route, $q, Vendors) {
        var deferred = $q.defer();
        Vendors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/vendorpart', {
    controller: 'VendorPartIndexCtrl',
    templateUrl: '/lib/public/angular/apps/vendorpart/views/index.html',
    resolve: {
      vendorparts: function ($route, $q, VendorParts) {
        var deferred = $q.defer();
        VendorParts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
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
    templateUrl: '/lib/public/angular/apps/vendor/views/edit.html',
    resolve: {
      vendor: function ($route, $q, Vendors) {
        //determine if we're creating or editing a vendor.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Vendors.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      vendorFamilies: function ($route, $q, VendorFamilies) {
        var deferred = $q.defer();
        VendorFamilies.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/vendor', {
    controller: 'VendorIndexCtrl',
    templateUrl: '/lib/public/angular/apps/vendor/views/index.html',
    resolve: {
      vendors: function ($route, $q, Vendors) {
        var deferred = $q.defer();
        Vendors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
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

  .when('/workorder/resumeorcreate', {
    needsLogin: true,
    controller: 'WorkOrderResumeOrCreateCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/index.html',
    resolve: {
      workorders: function ($route, $q, WorkOrders) {
        var deferred = $q.defer();
        WorkOrders.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/workorder/review/:id?', {
    needsLogin: true,
    controller: 'WorkOrderReviewCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/review.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders) {
        var deferred = $q.defer();
        var id = $route.current.params.id || null;
        if(!id) { deferred.reject(new Error("Missing Id")); }
        else {
          WorkOrders.get({id: id},
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var deferred = $q.defer();
        var id = $route.current.params.id || null;
        if(!id) { deferred.reject(new Error("Missing Id")); }
        else {
          ReviewNotes.query({workOrder: id},
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      },
      editHistories: function($route, $q, EditHistories){
        var deferred = $q.defer();
        var id = $route.current.params.id || null;
        if(!id) { deferred.reject(new Error("Missing Id")); }
        else{
          EditHistories.query({workOrder: id},
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      },
      users: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      me: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.get({id: 'me'},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        var deferred = $q.defer();
        ApplicationTypes.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/workorder/edit/:id?', {
    needsLogin: true,
    controller: 'WorkOrderEditCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders) {
        var deferred = $q.defer();
        var id = $route.current.params.id || null;
        if(!id) deferred.reject(new Error("Missing Id"));
        else {
          WorkOrders.get({id: id},
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var deferred = $q.defer();
        var id = $route.current.params.id || null;
        if(!id){ deferred.reject(new Error("Missing Id")); }
        else {
          ReviewNotes.query({workOrder: id},
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      },
      editHistories: function($route, $q, EditHistories){
        var deferred = $q.defer();
        var id = $route.current.params.id || null;
        if(!id){ deferred.reject(new Error("Missing Id")); }
        else{
          EditHistories.query({workOrder: id},
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      },
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) {return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      customers: function ($route, $q, Customers) {
        var deferred = $q.defer();
        Customers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      users: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      me: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.get({id: 'me'},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      parts: function ($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      counties: function ($route, $q, Counties) {
        var deferred = $q.defer();
        Counties.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      states: function ($route, $q, States) {
        var deferred = $q.defer();
        States.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        var deferred = $q.defer();
        ApplicationTypes.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      jsas: function ($route, $q, Jsas) {
        var deferred = $q.defer();
        Jsas.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/workorder', {
    needsLogin: true,
    controller: 'WorkOrderIndexCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/index.html',
    resolve: {
      workorders: function ($route, $q, WorkOrders) {
        var deferred = $q.defer();
        WorkOrders.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('WorkOrderApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);

angular.module('CommonDirectives')
.directive('checkBox', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/checkbox.html',
    scope: {
      labelText: '@',
      data: '=',
      disabled: '='
    }
  };
}]);

angular.module('CommonDirectives')
.directive('dateField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/datefield.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);

angular.module('CommonDirectives')
.directive('ngMin', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {

      var minValidator = function(viewValue){
        if(scope.min == 0){
          scope.check = (viewValue && (viewValue > -1)) ? 'valid' : undefined;
        } else if(scope.min == 1){
          scope.check = (viewValue && (viewValue > 0)) ? 'valid' : undefined;
        } else if(scope.min == null){
          scope.check = 'valid';
        }
        if(scope.check){
          ctrl.$setValidity('ngMin', true);
          if(elem.parent().hasClass('has-error')){
            elem.parent().removeClass('has-error');
            elem.parent().addClass('has-success');
          } else {
            elem.parent().addClass('has-success');
          }
          return viewValue;
        }
        else{
          ctrl.$setValidity('ngMin', false);
          if(elem.parent().hasClass('has-success')){
            elem.parent().removeClass('has-success');
            elem.parent().addClass('has-error');
          } else {
            elem.parent().addClass('has-error');
          }
          return undefined;
        }
      };

      ctrl.$parsers.unshift(minValidator);
    }
  };
})
.directive('numberField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/numberfield.html',
    scope: {
      labelText: '@',
      data: '=',
      min: '@',
      max: '@',
      name: '@',
      nonNegative: '@',
      integerOnly: '@',
      placeholderText: '@',
      disabled: '='
    }
  };
}]);

function isEmpty(value) {
  return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

angular.module('CommonDirectives')
.directive('priceField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/pricefield.html',
    scope: {
      labelText: '@',
      placeholderText: '@',
      data: '=',
      nonNegative: '@',
      integerOnly: '@',
      disabled: '='
    }
  };
}]);

angular.module('CommonComponents')
.component('selectList', {
  templateUrl: '/lib/public/angular/views/customElements/selectlist.html',
  bindings: {
    labelText: '@',
    selectField: '@',
    displayField: '@',
    onDataChange: '&',
    arrayList: '<',
    data: '<',
    disabled: '<'
  },
  controller: SelectListCtrl
});

function SelectListCtrl () {
  var self = this;

  // Pass back the Changed Item to Parent ------------------------------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item });
  };
  // -------------------------------------------------------------------
}

angular.module('CommonDirectives')

.directive('superTable', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      model: '='
    },
    controller: 'SuperTableCtrl',
    templateUrl: '/lib/public/angular/views/customElements/supertable.html'
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

angular.module('CommonDirectives')
.directive('textAreaField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/textareafield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@',
      rows: '@',
      disabled: '='
    }
  };
}]);

angular.module('CommonDirectives')
.directive('textField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/textfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@',
      disabled: '='
    }
  };
}]);

angular.module('CommonDirectives')
.directive('timeField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/timefield.html',
    scope: {
      show: '=',
      labelText: '@',
      data: '=',
      hours: '=',
      minutes: '=',
      disabled: '='
    }
  };
}]);

angular.module('CommonDirectives')
.directive('typeAhead', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/typeahead.html',
    scope: {
      labelText: '@',
      data: '=',
      selectField: '@',
      arrayList: '=',
      limit: '@',
      disabled: '='
    }
  };
}]);

/**
 *            GeneralPartList
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonComponents')
.controller('AddPartModalCtrl',['$scope', '$uibModalInstance',
  function ($scope, $uibModalInstance) {
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }])
.component('generalPartsList', {
  templateUrl: 'lib/public/angular/views/customContainers/GeneralPartsList.html',
  bindings: {
    ccData: '<',
    ccPanelTitle: '@',
    ccTableClass: '@',
    ccOnManualAdd: '&',
    ccOnDelete: '&'
  },
  controller: ['$uibModal',GeneralPartsListCtrl]
});

function GeneralPartsListCtrl ($uibModal) {
  // Variables ----------------------------------------------------------
  var self = this;
  // --------------------------------------------------------------------

  // This Calls the Manual Part Modal Ctrl Above ------------------------
  self.openManualPartModal = function(){
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/views/modals/manualAddPartModal.html',
      controller: 'AddPartModalCtrl'
    });

    // Take Results of Modal Instance and Push into Parts Array ---------
    modalInstance.result.then(function (part){
      var thisPart = part;
      thisPart.quantity = 0;
      thisPart.isManual = true;
      self.ccOnManualAdd({part: thisPart});
    });
  };
  // --------------------------------------------------------------------
}

/**
 *            selectTechWarehouseId
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonComponents')
.component('selectTechWarehouseId', {
  templateUrl: 'lib/public/angular/views/customContainers/selectTechWarehouseId.html',
  bindings: {
    ccPanelTitle: '@',
    ccClass: '@',
    ccLabel: '@',
    ccType: '@',
    ccOnDataChange: '&',
    ccData: '<',
    ccLocations: '<',
    ccTruckId: '<'
  },
  controller: ['LocationItemService', SelectTechOrWarehouseCtrl]
});

function SelectTechOrWarehouseCtrl (LocationItemService) {
  // Variables --------------------------------------------------
  var self = this;
  self.locationWarehouseArray = [];
  self.locationWarehouseNSIDArray = [];
  // ------------------------------------------------------------

  // Push All Warehouse ID --------------------------------------
  if (self.ccType === "name") {
    // get the location id array
    self.locationWarehouseArray = LocationItemService.getLocationNameArray(self.ccTruckId, self.ccLocations);
  }
  if (self.ccType === "netsuiteId") {
    // get all location Objects plus
    self.locationTechWarehouseObjArray = LocationItemService.getLocationTechWarehouseObjArray(self.ccTruckId, self.ccLocations);
  }
  // ------------------------------------------------------------


  // Pass Back Change to Parent ---------------------------------
  self.onChange = function (changedData) {
    self.ccOnDataChange({ item: changedData , type: self.ccType });
  };
  // ------------------------------------------------------------
}

angular.module('CountyApp.Controllers').controller('CountyEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Counties', 'county', 'states',
  function ($scope, $route, $location, AlertService, LoaderService, Counties, county, states) {

    $scope.title = county ? "Edit " + county.name :
                              "Create a new county";

    $scope.county = county;
    $scope.states = states;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.county._id) {
        // Edit an existing county.
        Counties.save({_id: county._id}, $scope.county,
          function (response) {
            $location.path("/county");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new county.
        Counties.save({}, $scope.county,
          function (response) {
            $location.path("/county");
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
      Counties.delete({id: county._id},
        function (response) {
          $location.path("/county");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('CountyApp.Controllers').controller('CountyIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'counties',
  function ($scope, $route, $location, AlertService, LoaderService, counties) {

    $scope.title = "Countys";

    $scope.counties = counties;

    $scope.editCounty = function (id) {
      $location.path("/county/edit/" + (id || ""));
    };

    $scope.createCounty = function () {
      $scope.editCounty();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Counties", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
  		counties.forEach(function (ele, ind, arr) {
        oList.push({_id: ele._id, name: ele.name, state: ele.state.name });
      });
      return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Name", objKey: "name" },
        { title: "State", objKey: "state" }
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editCounty(obj._id);
    }

    function getTableRowButtons () {
      var arr = [];
      var button = {};
      button.title = "edit";
      button.action = rowClickAction;
      arr.push(button);
      return arr;
    }

    function tableHeaderAction () { // takes no parameters
  		$scope.createCounty();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new county";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["state", "name"],
        descending: false,
      };
    }

}]);

angular.module('AreaApp.Controllers').controller('AreaEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Areas', 'area',
  function ($scope, $route, $location, AlertService, LoaderService, Areas, area) {

    $scope.title = area ? "Edit " + area.name : "Create a new area";

    $scope.area = area;
    $scope.locations = area ? area.locations : null;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.area._id) {
        // Edit an existing area.
        Areas.save({_id: $scope.area._id}, $scope.area,
          function (response) {
            $location.path("/area");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new area.
        Areas.save({name: $scope.area.name}, $scope.area,
          function (response) {
            $location.path("/area");
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
      Areas.delete({id: area._id},
        function (response) {
          $location.path("/area");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('AreaApp.Controllers').controller('AreaIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'areas',
  function ($scope, $route, $location, AlertService, LoaderService, areas) {

    $scope.title = "Areas";

    $scope.areas = areas;

    $scope.editArea = function (id) {
      $location.path("/area/edit/" + (id || ""));
    };

    $scope.createArea = function () {
      $scope.editArea();
    };

    	/* Table
    	--------------------------------------------------------------------------- */
      $scope.superTableModel = {
        tableName: "Areas", // displayed at top of page
        objectList: getObjectList(), // objects to be shown in list
        displayColumns: getTableDisplayColumns(),
    		rowClickAction: null, // takes a function that accepts an obj param
        rowButtons: getTableRowButtons(), // an array of button object (format below)
        headerButtons: getTableHeaderButtons(), // an array of button object (format below)
    		sort: getTableSort()
      };

    	function getObjectList () {
    		return areas;
    	}

      function getTableDisplayColumns () {
        return [ // which columns need to be displayed in the table
          { title: "Name", objKey: "name" },
          { title: "# Locations", objKey: "locations.length" },
        ];
      }

      function rowClickAction (obj) { // takes the row object
        $scope.editArea(obj._id);
      }

      function getTableRowButtons () {
        var arr = [];
        var button = {};
        button.title = "edit";
        button.action = rowClickAction;
        arr.push(button);
        return arr;
      }

      function tableHeaderAction () { // takes no parameters
    		$scope.createArea();
      }

      function getTableHeaderButtons() {
        var arr = [];
        var button = {};
        button.title = "new area";
        button.action = tableHeaderAction;
        arr.push(button);
        return arr;
      }

      function getTableSort () {
        return {
          column: ["name"],
          descending: [false],
        };
      }

}]);

angular.module('CompressorApp.Controllers').controller('CompressorEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Compressors', 'compressor', 'units',
  function ($scope, $route, $location, AlertService, LoaderService, Compressors, compressor, units) {

    $scope.title = compressor ? "Edit " + compressor.name : "Create a new compressor";

    $scope.compressor = compressor;
    $scope.units = units;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.compressor._id) {
        // Edit an existing compressor.
        Compressors.save({_id: $scope.compressor._id}, $scope.compressor,
          function (response) {
            $location.path("/compressor");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new compressor.
        Compressors.save({name: $scope.compressor.name}, $scope.compressor,
          function (response) {
            $location.path("/compressor");
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
      Compressors.delete({id: compressor._id},
        function (response) {
          $location.path("/compressor");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('CompressorApp.Controllers').controller('CompressorIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'compressors',
  function ($scope, $route, $location, AlertService, LoaderService, compressors) {

    $scope.title = "Compressors";

    $scope.compressors = compressors;

    $scope.editCompressor = function (id) {
      $location.path("/compressor/edit/" + (id || ""));
    };

    $scope.createCompressor = function () {
      $scope.editCompressor();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Compressors", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
      compressors.forEach(function (ele, ind, arr) {
        oList.push({
          _id: ele._id,
          serial: ele.serial,
          model: ele.model,
          compressorHours: ele.compressorHours,
          unit: ele.unit.number
        });
      });
  		return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Serial #", objKey: "serial" },
        { title: "Model", objKey: "model" },
        { title: "Hours", objKey: "compressorHours" },
        { title: "Unit", objKey: "unit"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editCompressor(obj._id);
    }

    function getTableRowButtons () {
      var arr = [];
      var button = {};
      button.title = "edit";
      button.action = rowClickAction;
      arr.push(button);
      return arr;
    }

    function tableHeaderAction () { // takes no parameters
  		$scope.createCompressor();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new compressor";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["serial"],
        descending: [false],
      };
    }

}]);

angular.module('InventoryTransferApp.Controllers').controller('InventoryTransferEditCtrl',
['$scope', '$window', '$location', '$timeout', 'AlertService', 'InventoryTransfers', 'inventorytransfer', 'parts', 'locations', 'users',
  function ($scope, $window, $location, $timeout, AlertService, InventoryTransfers, inventorytransfer, parts, locations, users){

    $scope.message = (inventorytransfer !== null ? "Edit " : "Create ") + "Inventory Transfer";
    $scope.inventorytransfer = inventorytransfer || newInventoryTransfer();

    $scope.parts = parts;
    $scope.locations = locations;

    $scope.save = function (){
      $scope.submitting = true;
      InventoryTransfers.save({_id: $scope.inventorytransfer._id}, $scope.inventorytransfer,
        function (response){
          AlertService.add('success', 'Save was successful.');
          $scope.submitting = false;
          $location.path('/myaccount');
        },
        function (err){
          AlertService.add('danger','An error occurred while attemping to save.');
          $scope.submitting = false;
        }
      );
    };

    $scope.destroy = function (){
      $scope.submitting = true;
      InventoryTransfers.destroy($scope.inventorytransfer,
        function (response){
          AlertService.add('success','Save was successful.');
          $scope.submitting = false;
          $location.path('/inventorytransfer');
        },
        function (err){
          AlertService.add('danger', 'An error occured whle attemping to save.');
          $scope.submitting = false;
        }
      );
    };

    $scope.partsTableModel = {
      tableName: "Search For Parts", // displayed at top of page
      objectList: parts, // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        { title: "Part #", objKey: "componentName" },
        { title: "Description", objKey: "description" }
      ],
      rowClickAction: addPart,
      rowButtons: null,
      headerButtons: null, // an array of button object (format below)
      sort: { column: ["number"], descending: false }
    };

    function addPart(part) {
      $scope.inventorytransfer.parts.push({
        number:       part.number,
        description:  part.description,
        cost:         0,
        laborCode:    "",
        quantity:     0,
        isBillable:   false,
        isWarranty:   false
      });
    }

    function newInventoryTransfer(){
      var newInventoryTransfer =
      {
        inventorytransferDate: new Date(),

        originLocation: {},
        destinationLocation: {},

        parts: []

      };
      return newInventoryTransfer;
    }
  }]);

angular.module('InventoryTransferApp.Controllers').controller('InventoryTransferIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'inventoryTransfers',
  function ($scope, $route, $location, AlertService, LoaderService, inventoryTransfers){

    $scope.title = "Inventory Transfers";

    $scope.editInventoryTransfer = function (id){
      $location.path('/inventoryTransfer/edit/' + (id || ''));
    };

    $scope.createInventoryTransfer = function (){
      $scope.editInventoryTransfer();
    };

  }]);

angular.module('EngineApp.Controllers').controller('EngineEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Engines', 'engine', 'units',
  function ($scope, $route, $location, AlertService, LoaderService, Engines, engine, units) {

    $scope.title = engine ? "Edit " + engine.name : "Create a new engine";

    $scope.engine = engine;
    $scope.units = units;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.engine._id) {
        // Edit an existing engine.
        Engines.save({_id: $scope.engine._id}, $scope.engine,
          function (response) {
            $location.path("/engine");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new engine.
        Engines.save({name: $scope.engine.name}, $scope.engine,
          function (response) {
            $location.path("/engine");
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
      Engines.delete({id: engine._id},
        function (response) {
          $location.path("/engine");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);

angular.module('EngineApp.Controllers').controller('EngineIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'engines',
  function ($scope, $route, $location, AlertService, LoaderService, engines) {

    $scope.title = "Engines";

    $scope.engines = engines;

    $scope.editEngine = function (id) {
      $location.path("/engine/edit/" + (id || ""));
    };

    $scope.createEngine = function () {
      $scope.editEngine();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Engines", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
      engines.forEach(function (ele, ind, arr) {
        oList.push({
          _id: ele._id,
          serial: ele.serial,
          model: ele.model,
          engineHours: ele.engineHours,
          unit: ele.unit.number
        });
      });
  		return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Serial #", objKey: "serial" },
        { title: "Model", objKey: "model" },
        { title: "Hours", objKey: "engineHours" },
        { title: "Unit", objKey: "unit"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editEngine(obj._id);
    }

    function getTableRowButtons () {
      var arr = [];
      var button = {};
      button.title = "edit";
      button.action = rowClickAction;
      arr.push(button);
      return arr;
    }

    function tableHeaderAction () { // takes no parameters
  		$scope.createEngine();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new engine";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["serial"],
        descending: [false],
      };
    }

}]);

angular.module('LocationApp.Controllers').controller('LocationEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Locations', 'location', 'customers', 'areas', 'states', 'counties',
  function ($scope, $route, $location, AlertService, LoaderService, Locations, location, customers, areas, states, counties) {

    $scope.title = location ? "Edit " + location.name : "Create a new location";

    $scope.location = location;
    $scope.customers = customers;
    $scope.states = states;
    $scope.counties = counties;
    $scope.locationTypes = [{name:"Lease"},{name:"Truck"}, {name:"Yard"}];

    $scope.$watch('location.state', function (newVal, oldVal) {
      if (newVal != oldVal) {
        if (newVal === null) { $scope.counties = counties; }
        $scope.counties = getCountiesForState(counties, newVal);
      }
    }, true);

    $scope.$watch('location.county', function (newVal, oldVal) {
      if (newVal != oldVal) {
        if (newVal === null) { $scope.states = states; }
        counties.forEach(function (ele, ind, arr) {
          if (ele._id == newVal) {
            $scope.location.state = ele.state._id;
          }
        });
      }
    }, true);

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.location._id) {
        // Edit an existing location.
        Locations.save({_id: $scope.location._id}, $scope.location,
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
        Locations.save({name: $scope.location.name}, $scope.location,
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
      Locations.delete({id: location._id},
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

    function getCountiesForState(counties, state) {
      var countyArr = [];
      if (state) {
        counties.forEach(function (ele) {
          if (ele.state._id == state) { countyArr.push(ele); }
        });
      } else {
        countyArr = counties;
      }
      countyArr.sort(function (a, b) {
        if (a.name > b.name) { return 1; }
        if (a.name < b.name) { return -1; }
        else { return 0; }
      });
      return countyArr;
    }
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

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Locations", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
      console.log(locations);
      locations.forEach(function (ele, ind, arr) {
        oList.push({
          _id: ele._id,
          name: ele.name,
          type: ele.locationType,
          customer: ele.customer.dbaCustomerName || null,
          area: (ele.area ? ele.area.name : null )
        });
      });
  		return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Name", objKey: "name" },
        { title: "Type", objKey: "type" },
        { title: "Customer", objKey: "customer" },
        { title: "Area", objKey: "area"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editLocation(obj._id);
    }

    function getTableRowButtons () {
      var arr = [];
      var button = {};
      button.title = "edit";
      button.action = rowClickAction;
      arr.push(button);
      return arr;
    }

    function tableHeaderAction () { // takes no parameters
  		$scope.createLocation();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new location";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["area", "name"],
        descending: [false],
      };
    }

}]);

angular.module('PartApp.Directives')

.directive('vendorParts', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/part/views/vendorparts.html',
    scope: true,
    controller: 'PartsVendorPartsCtrl'
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
      if ($scope.part._id) {
        // Edit an existing part.
        Parts.save({id: part._id}, $scope.part,
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
              $scope.part._id = response._id;
              console.log("part._id: ", $scope.part._id);
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
      Parts.delete({id: part._id},
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
        vp.PartId = $scope.part._id;
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
      $scope.editPart(obj._id);
    };

    var tableHeaderAction = function (obj) {
      $scope.createPart();
    };

    function getTableRowButtons () {
      var arr = [];

      var button = {};
      button.title = "edit";
      button.action = function (obj) { return; }; // we want the same functionality as row click action

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

/**
 *            poCreatePartModal
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.controller('AddPartModalCtrl', [ '$scope', '$uibModalInstance',
  function ($scope, $uibModalInstance) {
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }])
.component('pesPoCreatePart', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poCreatePart.html',
  bindings: {
    part: '<',
    onManualAdd: '&',
    onDelete: '&'
  },
  controller: [ '$uibModal', CreatePart]
});

function CreatePart ($uibModal) {
  // Variables ----------------------------------------------------------
  var self = this;
  // --------------------------------------------------------------------

  // Show Table of parts if Part Isn't Empty ----------------------------
  self.isEmpty = function () {
    if(_.isEmpty(self.part)){ return false; }
    return true;
  };
  // --------------------------------------------------------------------

  // Call the Modal for Manual Part Add ---------------------------------
  self.openManualPartModal = function () {
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/views/modals/manualAddPartModal.html',
      controller: 'AddPartModalCtrl'
    });

    // Modal Instance Result Calls Parent Function ----------------------
    modalInstance.result.then( function (part) {
      var thispart = part;
      thispart.quantity = 0;
      thispart.isManual = true;
      self.onManualAdd({part: thispart});
    });
  };
  // --------------------------------------------------------------------
}

/**
 *            poEditHeading
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoReviewHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewHeading.html',
  bindings: {
    partorder: '<'
  }
});


/**
 *            poEditTable
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoReviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewTable.html',
  bindings: {
    partorder: '<'   // one way data binding for partorder
  },
  controller: ['$location', ReviewTableCtrl]
});

function ReviewTableCtrl ($location) {
  this.completeForm = function () {
    $location.url('/partorder')
  };
}

/**
 *            poOverviewTable
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoOverviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poOverviewTable.html',
  bindings: {
    panelType: '<',
    partorders: '<',
    contentSwitch: '&'
  },
  controller: ['$location', OverviewCtrl]
});

function OverviewCtrl ($location) {
  var self = this;
  // Variable Declarations ---------------------------
  self.sortType = 'epoch';
  self.sortReverse = false;
  self.searchFilter = '';
  self.displayOrders = [];
  // -------------------------------------------------

  // Sorting for Table -------------------------------
  self.resort = function (by) {
    self.sortType = by;
    self.sortReverse = !self.sortReverse;
  };

  _.forEach(self.partorders, function (po) {
    po.epoch = new Date(po.timeCreated).getTime();
    return po;
  });
  // -------------------------------------------------

  // Set Display Type --------------------------------
  if ( self.panelType === 'incomplete' ) {
    _.forEach(self.partorders, function (obj) {
      if ( obj.status !== 'complete' ) {
        self.displayOrders.push(obj);
      }
    });
  }
  if ( self.panelType === 'completed' ) {
    _.forEach(self.partorders, function (obj) {
      if ( obj.status === 'complete' ) {
        self.displayOrders.push(obj);
      }
    });
  }
  // --------------------------------------------------

  // Search Table Content Switch ----------------------
  self.changeTable = function () {
    self.contentSwitch({ type: self.panelType });
  };
  // --------------------------------------------------

  // Routing ------------------------------------------
  self.routeToPartOrder = function (po) {
    $location.url('/partorder/review/' + po._id);
  };
  // --------------------------------------------------
}

/**
 *            PartOrderCreateCtrl
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers').controller('PartOrderCreateCtrl', ['$scope', '$timeout', '$uibModal', '$cookies', 'AlertService', 'GeneralPartSearchService', 'locations', 'parts',
  function ($scope, $timeout, $uibModal, $cookies, AlertService, GeneralPartSearchService, locations, parts) {
    // Variables ---------------------------------------------------------
    $scope.partorder = newPartOrder();
    $scope.parts = parts;
    $scope.locations = locations;
    $scope.truckId = $cookies.get('truckId');
    $scope.valid = false;
    //---------------------------------------------------------------------

    // Check if Part has Quantity ----------------------------------------
    $scope.$watch('partorder.part.quantity', function (newVal, oldVal) {
      if (newVal != oldVal) $scope.valid = newVal > 0;
    });
    // -------------------------------------------------------------------

    // Make shift part order ----------------------------------------------
    function newPartOrder () {
      return {
        truckId: '',
        destinationNSID: '',
        part: {}
      }
    }
    // Passed Functions to Add Part Component ----------------------------
    $scope.addManualPart = function (part) {
      $scope.partorder.part = part;
    };

    $scope.deletePart = function () {
      $scope.partorder.part = {};
    };

    $scope.updateDestination = function (item,type) {
      if(type === "netsuiteId"){
        $scope.partorder.destinationNSID = item;
      }
    };
    // --------------------------------------------------------------------

    // Construction for Search Table --------------------------------------
    $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'replace',$scope.partorder);
    // --------------------------------------------------------------------
  }]);

/**
 *            PartOrderCtrl
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers').controller('PartOrderCtrl',
  ['$scope', '$timeout', '$location','$q', '$cookies', 'AlertService',
    function ($scope, $timeout, $location, $q, $cookies, AlertService) {
      // Variables-----------------------------------------
      $scope.partorders = [];
      $scope.panelType = 'incomplete';
      $scope.spinner = true;
      // --------------------------------------------------

      // Turn Spinner Off ---------------------------------
      $scope.spinnerOff = function () {
        $scope.spinner = false;
      };
      // --------------------------------------------------

      // Look up Part Order Based on Query --------------
      $scope.PartOrderLookup = function (query) {
        var deferred = $q.defer();
        console.log("Looking up Part Orders...");
        PartOrders.query(query,
          function (res) {
            console.log("Part Orders Loaded.");
            return deferred.resolve(res);
          },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      };
      // ------------------------------------------------

      // Change Which panel is viewed ---------------------
      $scope.changePanelType = function (type) {
        if ( type === 'incomplete' ){
          $scope.panelType = 'completed';
        }
        if ( type === 'completed' ){
          $scope.panelType = 'incomplete';
        }
      };
      // --------------------------------------------------

      // Routing ------------------------------------------
      $scope.createPartOrder = function () {
        $location.url('/partorder/create');
      };
      // --------------------------------------------------








      function ClassPartOrders() {
        return {
          _id: '2',
          partNSID: null,
          part: {
            description:    '',
            componentName:  '',
            system:         null,
            subsystem:      null,
            engine:         null,
            compressor:     null,
            component:      null,
            revision:       null,
            MPN:            '',

            vendors: [{
              vendor: null,
              vendorPartNumber:       '',
              vendorPartCost:         null,
              vendorPartDescription:  ''
            }]
          },
          quantity: null,

          status: '',

          timeCreated: Date, //when it was created by technician
          timeSubmitted: Date, //when it was submitted to Orion
          timeShipped: Date, //time order was shipped
          timeComplete: Date, //time the order was completed

          techId: '', //Username
          managerId: '',
          originNSID: '',
          destinationNSID: '', //NSID

          trackingNumber: '',

          comment: String,
        }
      }
      var part = {
        description:    'HI-TEK S-1 GEO SAE 15W40 PARK 300 & 900 SERIES',
        componentName:  '4600.002.01',
        system:         null,
        subsystem:      null,
        engine:         null,
        compressor:     null,
        component:      null,
        revision:       null,
        MPN:            'OILR157',

        vendors: [{
          vendor: null,
          vendorPartNumber:       '',
          vendorPartCost:         null,
          vendorPartDescription:  ''
        }]
      };
      $scope.newPartOrder = ClassPartOrders();
      $scope.newPartOrder.partNSID = 2858;
      $scope.newPartOrder.part = part;
      $scope.newPartOrder.quantity = 3;
      $scope.newPartOrder.status = 'pending';
      $scope.newPartOrder.timeCreated = new Date('10/17/2016 10:32:31');
      $scope.newPartOrder.timeSubmitted = new Date();
      $scope.newPartOrder.timeShipped = new Date();
      $scope.newPartOrder.techId = 'MWH001';
      $scope.newPartOrder.originNSID = '0001';
      $scope.newPartOrder.destinationNSID = '';
      $scope.newPartOrder.comment = 'This is a test';
      $scope.partorders.push($scope.newPartOrder);

      $scope.secondPartOrder = ClassPartOrders();
      $scope.secondPartOrder._id = 3;
      $scope.secondPartOrder.partNSID = 2258;
      $scope.secondPartOrder.part = part;
      $scope.secondPartOrder.quantity = 1;
      $scope.secondPartOrder.status = 'shipped';
      $scope.secondPartOrder.timeCreated = new Date('10/17/2016 10:31:30');
      $scope.secondPartOrder.timeSubmitted = new Date();
      $scope.secondPartOrder.timeShipped = new Date();
      $scope.secondPartOrder.techId = 'MWH001';
      $scope.secondPartOrder.originNSID = '0000';
      $scope.secondPartOrder.destinationNSID = 'FAR0001';
      $scope.secondPartOrder.comment = 'This is a test 2';
      $scope.partorders.push($scope.secondPartOrder);

      $scope.third = ClassPartOrders();
      $scope.third._id = 4;
      $scope.third.partNSID = 2259;
      $scope.third.part = part;
      $scope.third.quantity = 32;
      $scope.third.status = 'canceled';
      $scope.third.timeCreated = new Date('10/17/2016 10:32:30');
      $scope.third.timeSubmitted = new Date();
      $scope.third.timeShipped = new Date();
      $scope.third.techId = 'MWH001';
      $scope.third.originNSID = '0000';
      $scope.third.destinationNSID = '';
      $scope.third.comment = 'This is a test 3';
      $scope.partorders.push($scope.third);

      $scope.fourth = ClassPartOrders();
      $scope.fourth._id = '5';
      $scope.fourth.partNSID = 1259;
      $scope.fourth.part = part;
      $scope.fourth.quantity = 35;
      $scope.fourth.status = 'backorder';
      $scope.fourth.timeCreated = new Date('10/17/2016 10:29:30');
      $scope.fourth.timeSubmitted = new Date();
      $scope.fourth.timeShipped = null;
      $scope.fourth.techId = 'MWH001';
      $scope.fourth.originNSID = '0000';
      $scope.fourth.destinationNSID = '';
      $scope.fourth.comment = 'This is a test 5';
      $scope.partorders.push($scope.fourth);

      // completed
      $scope.fifth = ClassPartOrders();
      $scope.fifth._id = '10';
      $scope.fifth.partNSID = 3456;
      $scope.fifth.part = part;
      $scope.fifth.quantity = 10;
      $scope.fifth.status = 'complete';
      $scope.fifth.timeCreated = new Date('10/17/2016 10:29:30');
      $scope.fifth.timeSubmitted = new Date();
      $scope.fifth.timeShipped = new Date();
      $scope.fifth.timeComplete = new Date();
      $scope.fifth.techId = 'MWH001';
      $scope.fifth.originNSID = '0000';
      $scope.fifth.destinationNSID = 'FAR0001';
      $scope.fifth.comment = 'This is a test 5';
      $scope.partorders.push($scope.fifth);

      //---------------------------------------------------------------------
    }]);

/**
 *            PartOrderEditCtrl
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers').controller('PartOrderReviewCtrl',
  ['$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService',
    function ($scope, $location, $timeout, $uibModal, $cookies, AlertService) {
      //---------------------------------------------------------------------
      $scope.hello = "hello world";
      $scope.partorder = {};
      $scope.partorders = [];
      function ClassPartOrders() {
        return {
          _id: '2',
          partNSID: null,
          part: {
            description:    '',
            componentName:  '',
            system:         null,
            subsystem:      null,
            engine:         null,
            compressor:     null,
            component:      null,
            revision:       null,
            MPN:            '',

            vendors: [{
              vendor: null,
              vendorPartNumber:       '',
              vendorPartCost:         null,
              vendorPartDescription:  ''
            }]
          },
          quantity: null,

          status: '',

          timeCreated: Date, //when it was created by technician
          timeSubmitted: Date, //when it was submitted to Orion
          timeShipped: Date, //time order was shipped
          timeComplete: Date, //time the order was completed

          techId: '', //Username
          managerId: '',
          originNSID: '',
          destinationNSID: '', //NSID

          trackingNumber: '',

          comment: String,
        }
      }
      var part = {
        description:    'HI-TEK S-1 GEO SAE 15W40 PARK 300 & 900 SERIES',
        componentName:  '4600.002.01',
        system:         null,
        subsystem:      null,
        engine:         null,
        compressor:     null,
        component:      null,
        revision:       null,
        MPN:            'OILR157',

        vendors: [{
          vendor: null,
          vendorPartNumber:       '',
          vendorPartCost:         null,
          vendorPartDescription:  ''
        }]
      };
      $scope.newPartOrder = ClassPartOrders();
      $scope.newPartOrder.partNSID = 2858;
      $scope.newPartOrder.part = part;
      $scope.newPartOrder.quantity = 3;
      $scope.newPartOrder.status = 'pending';
      $scope.newPartOrder.timeCreated = new Date('10/17/2016 10:32:31');
      $scope.newPartOrder.timeSubmitted = null;
      $scope.newPartOrder.timeShipped = null;
      $scope.newPartOrder.techId = 'MWH001';
      $scope.newPartOrder.originNSID = '';
      $scope.newPartOrder.destinationNSID = '0001';
      $scope.newPartOrder.comment = 'This is a test';
      $scope.newPartOrder.managerId = '';
      $scope.newPartOrder.trackingNumber = '';
      $scope.partorders.push($scope.newPartOrder);

      $scope.secondPartOrder = ClassPartOrders();
      $scope.secondPartOrder._id = '3';
      $scope.secondPartOrder.partNSID = 2258;
      $scope.secondPartOrder.part = part;
      $scope.secondPartOrder.quantity = 1;
      $scope.secondPartOrder.status = 'shipped';
      $scope.secondPartOrder.timeCreated = new Date('10/17/2016 10:31:30');
      $scope.secondPartOrder.timeSubmitted = new Date();
      $scope.secondPartOrder.timeShipped = new Date();
      $scope.secondPartOrder.techId = 'MWH001';
      $scope.secondPartOrder.originNSID = 'FAR0001';
      $scope.secondPartOrder.destinationNSID = '0000';
      $scope.secondPartOrder.comment = 'This is a test 2';
      $scope.secondPartOrder.managerId = 'CAN001';
      $scope.secondPartOrder.trackingNumber = '029384-0343983';
      $scope.partorders.push($scope.secondPartOrder);

      $scope.third = ClassPartOrders();
      $scope.third._id = '4';
      $scope.third.partNSID = 2259;
      $scope.third.part = part;
      $scope.third.quantity = 32;
      $scope.third.status = 'canceled';
      $scope.third.timeCreated = new Date('10/17/2016 10:32:30');
      $scope.third.timeSubmitted = new Date();
      $scope.third.timeShipped = null;
      $scope.third.techId = 'MWH001';
      $scope.third.originNSID = '';
      $scope.third.destinationNSID = '0000';
      $scope.third.comment = 'This is a test 3';
      $scope.third.managerId = 'CAN001';
      $scope.third.trackingNumber = '';
      $scope.partorders.push($scope.third);

      $scope.fourth = ClassPartOrders();
      $scope.fourth._id = '5';
      $scope.fourth.partNSID = 1259;
      $scope.fourth.part = part;
      $scope.fourth.quantity = 35;
      $scope.fourth.status = 'backorder';
      $scope.fourth.timeCreated = new Date('10/17/2016 10:29:30');
      $scope.fourth.timeSubmitted = new Date();
      $scope.fourth.timeShipped = null;
      $scope.fourth.techId = 'MWH001';
      $scope.fourth.originNSID = 'FAR0001';
      $scope.fourth.destinationNSID = '0000';
      $scope.fourth.comment = 'This is a test 5';
      $scope.fourth.managerId = 'CAN001';
      $scope.fourth.trackingNumber = '';
      $scope.partorders.push($scope.fourth);

      // completed
      $scope.fifth = ClassPartOrders();
      $scope.fifth._id = '10';
      $scope.fifth.partNSID = 3456;
      $scope.fifth.part = part;
      $scope.fifth.quantity = 10;
      $scope.fifth.status = 'complete';
      $scope.fifth.timeCreated = new Date('10/17/2016 10:29:30');
      $scope.fifth.timeSubmitted = new Date();
      $scope.fifth.timeShipped = new Date();
      $scope.fifth.timeComplete = new Date();
      $scope.fifth.techId = 'MWH001';
      $scope.fifth.managerId = 'CAN001';
      $scope.fifth.originNSID = '0000';
      $scope.fifth.destinationNSID = 'FAR0001';
      $scope.fifth.trackingNumber = '234098723-q09039843';
      $scope.fifth.comment = 'This is a test 5';
      $scope.partorders.push($scope.fifth);

      $scope.urlId = $location.path().split('/').pop();
      _.forEach($scope.partorders, function (obj) {
        if($scope.urlId === obj._id){
          $scope.partorder = obj;
        }
      });

      $scope.completeForm = function () {
        $location.url('/partorder')
      };
      //---------------------------------------------------------------------
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
      if ($scope.customer._id) {
        // Edit an existing customer.
        Customers.save({_id: customer._id}, $scope.customer,
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
      Customers.delete({id: customer._id},
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

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Customers", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
  		return customers;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "DBA", objKey: "dbaCustomerName" },
        { title: "Family", objKey: "customerFamily"},
        { title: "Phone", objKey: "phone"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editCustomer(obj._id);
    }

    function getTableRowButtons () {
      var arr = [];
      var button = {};
      button.title = "edit";
      button.action = rowClickAction;
      arr.push(button);
      return arr;
    }

    function tableHeaderAction () { // takes no parameters
  		$scope.createCustomer();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new customer";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["dbaCustomerName"],
        descending: [false],
      };
    }

}]);

angular.module('SupportApp.Controllers').controller('SupportIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'me',
  function ($scope, $route, $location, AlertService, LoaderService, me){
    $scope.me = me;
    $scope.title = "Support";

}]);

angular.module('ServicePartnerApp.Controllers').controller('ServicePartnerEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'ServicePartners', 'servicePartner',
  function ($scope, $route, $location, AlertService, LoaderService, ServicePartners, servicePartner) {

    $scope.title = servicePartner ? "Edit " + servicePartner.name :
                                    "Create a new service partner";

    $scope.servicePartner = servicePartner;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.servicePartner._id) {
        // Edit an existing servicePartner.
        ServicePartners.save({id: servicePartner._id}, $scope.servicePartner,
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
      ServicePartners.delete({id: servicePartner._id},
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
['$scope', '$window', '$location', '$timeout', 'AlertService', 'Transfers', 'transfer', 'units', 'customers', 'users', 'states', 'counties',
  function ($scope, $window, $location, $timeout, AlertService, Transfers, transfer, units, customers, users, states, counties) {

    $scope.message = (transfer !== null ? "Edit " : "Create ") + "Transfer";
    $scope.transfer = transfer || newTransfer();

    $scope.units = units;
    $scope.customers = customers;
    users.forEach(function (u){
      u.fullname = u.firstName + ' ' + u.lastName;
    });
    $scope.users = users;
    $scope.states = states;
    $scope.counties = counties;

    $scope.today =  Date.now();

    $scope.status = {
      opened: false
    };

    $scope.open = function ($event) {
      $scope.status.opened = true;
    };

    $scope.$watch(
      function () { return $scope.transfer.unit; },
      function ( newValue, oldValue) {
        $scope.transfer.origin.customer = $scope.transfer.unit.Customer;
        $scope.transfer.origin.county = $scope.transfer.unit.county;
        $scope.transfer.origin.state = $scope.transfer.unit.state;
        $scope.transfer.origin.location = $scope.transfer.unit.locationName;
        $scope.transfer.origin.legal = $scope.trasnfer.unit.legalDescription;
      }, true );


    $scope.save = function () {
      console.log('Saving');
      $scope.submitting = true;
      console.log($scope.transfer);
      Transfers.save({_id: $scope.transfer._id}, $scope.transfer,
        function (response) {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/transfer");
        },
        function (err) {
          console.log(err);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        }
      );
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Transfers.destroy($scope.transfer,
        function (response) {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/myaccount");
        },
        function (err) {
          console.log(err);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        }
      );
    };


    function newTransfer() {
      var newTrans =
      {
        transferDate :  new Date(),

        unit: {number: ''},

        origin : {
          customer : {},
          county : {},
          state : {},
          location: '',
          legal : '',
        },

        destination : {
          customer : {},
          location: '',
          legal : '',
        },

        transferedBy : {},

        transferNote : ""

      };
      return newTrans;
    }
}]);

angular.module('TransferApp.Controllers').controller('TransferIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'transfers',
  function ($scope, $route, $location, AlertService, LoaderService, transfers) {

    $scope.title = "Transfers";

    $scope.editTransfer = function (id) {
      $location.path("/transfer/edit/" + (id || ""));
    };

    $scope.createTransfer = function () {
      $scope.editTransfer();
    };

}]);

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
      if ($scope.user._id) {
        // Edit an existing user.
        Users.save({id: user._id}, $scope.user,
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
      Users.delete({id: user._id},
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
        { title: "Username",    objKey: "username" },
      ];
    }

    function getTableSort () {
      return {
        column: "firstName",
        descending: false,
      };
    }

    var tableRowAction = function (obj) {
      $scope.editUser(obj._id);
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
      if ($scope.vendor._id) {
        // Edit an existing vendor.
        Vendors.save({id: vendor._id}, $scope.vendor,
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
      Vendors.delete({id: vendor._id},
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
      if ($scope.unit._id) {
        // Edit an existing unit.
        Units.save({id: unit._id}, $scope.unit,
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
      Units.delete({id: unit._id},
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
        if (!$scope.unit._id) {
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
    $scope.userName = $cookies.get('userName');
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
      if ($scope.vendorpart._id) {
        // Edit an existing vendor.
        VendorParts.save({id: vendorpart._id}, $scope.vendorpart,
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
      VendorParts.delete({id: vendorpart._id},
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
        return p._id === id;
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
['$window', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'ReviewNotes', 'EditHistories', 'workorder', 'reviewNotes', 'editHistories', 'units', 'customers', 'users', 'me', 'parts', 'counties', 'states', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, WorkOrders, ReviewNotes, EditHistories, workorder, reviewNotes, editHistories, units, customers, users, me, parts, counties, states, applicationtypes) {

    $scope.message = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    // scope holding objects.
    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.me = me;
    $scope.parts = parts;
    $scope.counties = counties;
    $scope.states = states;
    $scope.applicationtypes = applicationtypes;
    $scope.workorder = workorder;
    $scope.reviewNotes = reviewNotes;
    $scope.editHistories = editHistories;
    $scope.unitValid = null;

    $scope.hours = getHours();
    $scope.minutes = getMinutes();
    $scope.pad = TimeDisplayService.pad;

    // Arrays for individual collecitons
    $scope.customersArray = [];
    $scope.countiesArray = [];
    $scope.statesArray = [];

    // Arrays of values. search once on page load.
    $scope.unitNumberArray = [];
    $scope.unitCustomerArray = [];
    $scope.unitLocationArray = [];
    $scope.unitCountiesArray = [];
    $scope.unitStateArray = [];
    // Array for rideAlong and app types
    $scope.userRideAlongArray = [];

    $scope.SyncedToNetsuite = $scope.workorder.timeSynced || $scope.workorder.updated_at;

    // map users first and lastname into userRideAlongArray
    _.map($scope.users,function(obj){
      $scope.userRideAlongArray.push(obj.firstName.concat(" ").concat(obj.lastName));
    });
      // the rest of the arrays filled for individual quering. IE not associated with unit #
      // kept seperate just in case we need to pull anything from these objects later.
    _.map($scope.counties,function(obj){
      $scope.countiesArray.push(obj.name);
    });
    _.map($scope.customers,function(obj){
      $scope.customersArray.push(obj.name);
    });
    _.map($scope.states,function(obj){
      $scope.statesArray.push(obj.name);
    });
    // map and fill all arrays so they can easily be sorted and called upon, indexes match up.
    _.map($scope.units,function(obj){
      $scope.unitNumberArray.push(obj.number);
      $scope.unitCustomerArray.push(obj.customerName);
      $scope.unitLocationArray.push(obj.locationName);
      if(obj.county){
        $scope.unitCountiesArray.push(obj.county.name);
      }else{
        $scope.unitCountiesArray.push("");
      }
      if(obj.state){
        $scope.unitStateArray.push(obj.state.name);
      }else{
        $scope.unitStateArray.push("");
      }
    });

    // return user object from id
    function getUser(id){
     for(var i = 0; i < $scope.users.length; i++){
       if($scope.users[i].username === id){
         return $scope.users[i];
       }
     }
    }

    // Auto fill for header information
    $scope.$watch('workorder.header.unitNumber', function (newVal, oldVal) {

      //set $scope.workorder.unit to null if certain params are met.
      if($scope.workorder.unit && (newVal !== oldVal)){
        $scope.workorder.unit = null;
      }
      // needed to auto fill the header on the correct unit number
      if(newVal !== oldVal){ // also keep from filling in with old workorder unit on page reload
        var unitNumberIndex = $scope.unitNumberArray.indexOf(newVal);
        if(unitNumberIndex !== -1){
          $scope.workorder.header.state = $scope.unitStateArray[unitNumberIndex];
          $scope.workorder.header.county = $scope.unitCountiesArray[unitNumberIndex];
          $scope.workorder.header.leaseName = $scope.unitLocationArray[unitNumberIndex];
          $scope.workorder.header.customerName = $scope.unitCustomerArray[unitNumberIndex];
          $scope.workorder.header.unitNumber = $scope.unitNumberArray[unitNumberIndex];
          $scope.workorder.unit = $scope.units[unitNumberIndex];

          // Auto poplulate JSA customer and location
          $scope.workorder.jsa.location = $scope.unitLocationArray[unitNumberIndex];
          $scope.workorder.jsa.customer = $scope.unitCustomerArray[unitNumberIndex];
        } else {
          // clear both location and customer from jsa if unit does not exist.
          $scope.workorder.jsa.customer = '';
          $scope.workorder.jsa.location = '';
        }
      }
      $scope.workorder.unitNumber = $scope.workorder.header.unitNumber;
    });

    $scope.$watch('workorder.laborCodes.basic',function(newVal, oldVal){
      if(
        $scope.workorder.laborCodes.basic.positiveAdj.hours > 0 ||
        $scope.workorder.laborCodes.basic.negativeAdj.hours > 0 ||
        $scope.workorder.laborCodes.basic.positiveAdj.minutes > 0 ||
        $scope.workorder.laborCodes.basic.negativeAdj.minutes > 0){
        $scope.timeadjustment = true;
      } else {
        $scope.timeAdjustment = false;
      }
    }, true);

//============================================================================
    // Client runs on angular 1.2.29 which the code there works and Orion is on 1.3.20 wich that code on the client has been changed. This is the only way without having to disable other checkboxes on change.
    $scope.type = [
      { text: "Corrective", value: false },
      { text: "Trouble Call", value: false },
      { text: "New Set", value: false },
      { text: "Release", value: false },
      { text: "Indirect", value: false }
    ];

    // If the object is set to true, set type to that obj, and clear all other types.
    $scope.setTypes = function(obj){
      if(obj.value === true){
        $scope.workorder.type = obj.text;
        $scope.type.forEach(function(i){
          if(i.text !== obj.text){
            i.value = false;
          }
        });
      }
    };

    $scope.nonPmType = function(){
      if($scope.workorder.pm){
        $scope.workorder.pm = false;
      }
    };

    // This is ran any time there is a change to the PM checkbox
    $scope.pmChange = function(pm){
      if(pm === true){
        if ($scope.workorder.type === 'New Set' || $scope.workorder.type === 'Release' || $scope.workorder.type === 'Indirect') {
          $scope.workorder.type = '';
          // don't clear corrective or trouble call if either is set.
          $scope.type[2].value = false; // new set
          $scope.type[3].value = false; // release
          $scope.type[4].value = false; // indirect
        }
      }
    };

    // Triggered on change to specific checkbox but all but PM call this function, if a pm type just set it. if not a pm type make pm false if true then set.
    $scope.typeChange = function(obj){
      if(obj.text === "Corrective" || obj.text === "Trouble Call"){
        $scope.setTypes(obj);
      }else{
        $scope.nonPmType();
        $scope.setTypes(obj);
      }
    };

    // on page load set checkboxes
    if($scope.workorder.pm){
      // you can have either Corrective or Trouble Call selected at the same time you have PM selected but only one
      if($scope.workorder.type === "Corrective"){
        $scope.type[0].value = true;
      }else if($scope.workorder.type === "Trouble Call"){
        $scope.type[1].value = true;
      }
    }else{
      // otherwise PM is not selected in that case only one of the fallowing can be selected.
      switch($scope.workorder.type){
        case "Corrective":
          $scope.type[0].value = true;
          break;
        case "Trouble Call":
          $scope.type[1].value = true;
          break;
        case "New Set":
          $scope.type[2].value = true;
          break;
        case "Release":
          $scope.type[3].value = true;
          break;
        case "Indirect":
          $scope.type[4].value = true;
          break;
        default:
          console.log($scope.workorder.type);
      }
    }

//----------------------------------------------------------------------
// NOTES
// Create an [] to display all notes in database and easily push to on save if saved.

    // init display notes with an empty array.
    $scope.displayNotes = [];
    // the schema is described here for that empty array to be filled with these objects.
    function ClassDisplayNote() {
      return {
        firstname: '',
        lastname: '',
        note: '',
        workOrder: null,
        updated_at: Date
      };
    }
    // load all notes that are in the database.
    _.map($scope.reviewNotes, function(comment){
      // make sure there is even a comment to look at and that it matches up with this workorder
      if($scope.workorder._id === comment.workOrder){
        var thisUser = getUser(comment.user);
        var thisNote = ClassDisplayNote();
        thisNote.firstname = thisUser.firstName;
        thisNote.lastname = thisUser.lastName;
        thisNote.note = comment.note;
        thisNote.updated_at = comment.updated_at;
        $scope.displayNotes.push(thisNote);
      }
    });
//-------------------------------------------------------------------------
// create single object to hold single note to push to the database and the display array if saved correctly.

    // create object model to data bind comment input to.
    $scope.comment = ClassNote();
    // create model object to work off of
    function ClassNote() {
      return {
        note: '',
        workOrder: $scope.workorder._id
      };
    }
    // boolean value to keep from editing note while it is sending
    $scope.sendingNote = false;
    // save the new note to the database
    $scope.newNote = function(){
      // save to database will go here only if comment was filled
      if($scope.comment.note){
        $scope.sendingNote = true;
        // save to database
        console.log("Saving new note...");
        ReviewNotes.save({}, $scope.comment,
          function (response) {
            $scope.sendingNote = false;
            console.log(response);
            console.log("Successful save.");
            // save note to display.
            var displayNote = ClassDisplayNote();
            displayNote.firstname = $scope.me.firstName;
            displayNote.lastname = $scope.me.lastName;
            displayNote.note = $scope.comment.note;
            displayNote.updated_at = response.updated_at;
            $scope.displayNotes.unshift(displayNote);
            // clear display note from form
            $scope.comment.note = null;
          },
          function (err) {
            $scope.sendingNote = false;
            console.log(err);
            console.log("Error Saving Note.");
            $scope.comment.note = null;
          }
        );
      }
    };

//-----------------------------------------------------------------------
// Submissions
// make the display for all submission history
    $scope.displaySubmissions = [];

    //create display class for Submissions
    function ClassSubmission(){
      return {
        type: '',
        firstname: '',
        lastname: '',
        submissionTime: Date
      };
    }

    // only do if tech has submitted wo.
    if($scope.workorder.timeSubmitted){
      // Tech Submission
      var thisUser = getUser($scope.workorder.techId);
      var techSubmission = ClassSubmission();
      techSubmission.type = "Submission";
      techSubmission.firstname = thisUser.firstName;
      techSubmission.lastname = thisUser.lastName;
      techSubmission.submissionTime = $scope.workorder.timeSubmitted;
      $scope.displaySubmissions.push(techSubmission);
      // Manager Review
      if($scope.workorder.timeApproved){
        thisUser = getUser($scope.workorder.approvedBy);
        var managerSubmission = ClassSubmission();
        managerSubmission.type = "Reviewed";
        managerSubmission.firstname = thisUser.firstName;
        managerSubmission.lastname = thisUser.lastName;
        managerSubmission.submissionTime = $scope.workorder.timeApproved;
        $scope.displaySubmissions.push(managerSubmission);
      }
      // ADMIN SYNC
      if($scope.workorder.timeSynced){
        thisUser = getUser($scope.workorder.syncedBy);
        var adminSubmission = ClassSubmission();
        adminSubmission.type = "Synced";
        adminSubmission.firstname = thisUser.firstName;
        adminSubmission.lastname = thisUser.lastName;
        adminSubmission.submissionTime = $scope.workorder.timeSynced;
        $scope.displaySubmissions.push(adminSubmission);
      }
    }

//-----------------------------------------------------------------------
// History Changes
// create the view for all edits
    $scope.displayChanges = [];

    function ClassDisplayHistory() {
      return {
        panelName: '',
        itemName: '',
        type: '',
        before: '',
        after: ''
      };
    }
    // load all edits from the database
    _.map($scope.editHistories, function(edit){
      // format the data correctly for presentation.
      if($scope.workorder._id === edit.workOrder){
        var thisEdit = ClassDisplayHistory();
        thisEdit.panelName = edit.path[0];
        thisEdit.itemName = edit.path.pop();
        thisEdit.type = edit.editType;
        thisEdit.before = edit.before;
        thisEdit.after = edit.after;
        $scope.displayChanges.push(thisEdit);
      }
    });
    // load the username of the admin who made the edits. and get the count
    if($scope.editHistories.length !== 0){
      $scope.editor = getUser($scope.editHistories.pop().user);
      $scope.editCount = $scope.editHistories.length + 1;
    }

//-----------------------------------------------------------------------

    $scope.highMileageConfirm = false;

    $scope.save = function () {
      $scope.submitting = true;
      console.log($scope.workorder);
      $scope.allowSubmit = true;
      if($scope.workorder.header.startMileage >  $scope.workorder.header.endMileage){
        $scope.openErrorModal('woMileageError.html');
        $scope.allowSubmit = false;
      }
      if(($scope.unaccountedH < 0 || $scope.unaccountedM < -15) || ($scope.unaccountedH > 0 || $scope.unaccountedM > 15) && $scope.timeadjustment === false){
        $scope.openErrorModal('woUnaccoutedTimeError.html');
        $scope.allowSubmit = false;
      }
      if(($scope.workorder.header.endMileage - $scope.workorder.header.startMileage) > 75 && !$scope.highMileageConfirm){
        $scope.openConfirmationModal('woHighMileageConfirmation.html');
        $scope.allowSubmit = false;
      }

      if($scope.allowSubmit){
        if($cookies.get('role') === "admin"){
          WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
            function (response) {
              AlertService.add("success", "Update was successful!");
                $scope.submitting = false;
                $location.path("/workorder/review/" + $scope.workorder._id);
            },
            function (err) {
              console.log(err);
                AlertService.add("danger", "An error occurred while attempting to update.");
                $scope.submitting = false;
            }
          );
        }
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      WorkOrders.delete({id: workorder._id},
        function (response) {
          $location.path("/myaccount");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    $scope.usedLaborCodes = [];
      // set usedLaborCodes array with every used labor code with the text of that labor code
      $scope.getUsedLaborCodes = function () {
        angular.forEach($scope.workorder.laborCodes, function (lc) {
          angular.forEach(lc, function (code) {
            if (code.hours > 0 || code.minutes > 0) {
              if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
                $scope.usedLaborCodes.push(code.text);
              }
            }
          });
        });
        $timeout(function () {
          $scope.getUsedLaborCodes();
        }, 300);
      };

    // TimeDisplayService handles all time display issues with HH:MM
    // refactored 9.5.16
    $scope.getTimeElapsed = function () {
      var start = new Date($scope.workorder.timeStarted);
      var now = $scope.workorder.timeSubmitted ?
        new Date($scope.workorder.timeSubmitted) :
        new Date();
      // e short for elapsed
      $scope.eMilli = (now.getTime() - start.getTime()).toFixed();
      $scope.eSeconds = Math.floor((($scope.eMilli / 1000) % 60));
      $scope.eMinutes = Math.floor((($scope.eMilli / (6e4) % 60)));
      $scope.eHours = Math.floor((($scope.eMilli / (36e5))));

      $timeout(function () { $scope.getTimeElapsed(); }, 300);
    };

    // get total wo time based on used labor codes
    // refactored 9.5.16
    $scope.getTotalLaborTime = function () {
      $scope.laborH = 0;
      $scope.laborM = 0;
      $scope.totalMinutes = 0;
      angular.forEach($scope.workorder.laborCodes, function (lc) {
        angular.forEach(lc, function (code) {
          if (code.text == 'Negative Adjustment') {
            $scope.totalMinutes -= code.hours * 60;
            $scope.totalMinutes -= code.minutes;
          } else {
            $scope.totalMinutes += code.hours * 60;
            $scope.totalMinutes += code.minutes;
          }
        });
      });
      $scope.laborH = parseInt($scope.totalMinutes / 60);
      $scope.laborM = Math.round($scope.totalMinutes % 60);
      $scope.totalLabor = TimeDisplayService.timeManager($scope.laborH,$scope.laborM);

      $timeout(function () { $scope.getTotalLaborTime(); }, 300);
    };

     // get unaccounted for time based on used labor coded and elapsed time FIX
    // refactored 9.5.16
    $scope.getUnaccountedTime = function () {
      $scope.unaccountedM = ($scope.eHours - $scope.laborH)*60;
      $scope.unaccountedM += $scope.eMinutes - $scope.laborM;
      $scope.unaccountedH = parseInt($scope.unaccountedM/60);
      $scope.unaccountedM = Math.round($scope.unaccountedM%60);
      $scope.unaccountedTime = TimeDisplayService.timeManager($scope.unaccountedH,$scope.unaccountedM);

      $timeout(function () { $scope.getUnaccountedTime(); }, 300);
    };

    function getHours() {
      var hours = [];
      var i = 0;
      while (i <= 24) {
        hours.push(i);
        i++;
      }
      return hours;
    }

    function getMinutes() {
      var minutes = [];
      var i = 0;
      while (i < 60) {
        minutes.push(i);
        i+=15;
      }
      return minutes;
    }

    // function getTechnician(){
    //   var techId = $cookies.get('userId');
    //   return techId;
    // }

     /* Populate search field for parts
      --------------------------------------------------------------------------- */
      parts = parts.map(function (part) {
        part.searchStr = [part.description, part.componentName, part.MPN].join(' ');
        return part;
      });

  	/* Model for the add part table
  	--------------------------------------------------------------------------- */
    $scope.partsTableModel = {
      tableName: "Search For Parts", // displayed at top of page
      objectList: parts, // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        { title: "Part #", objKey: "componentName" },
        { title: "MPN", objKey: "MPN" },
        { title: "Description", objKey: "description" }
      ],
  		rowClickAction: addPart,
      rowButtons: null,
      headerButtons: null, // an array of button object (format below)
  		sort: { column: ["number"], descending: false }
    };

    function addPart(part) {
      $scope.workorder.parts.push({
        vendor:       part.vendor,
        number:       part.number,
        description:  part.description,
        cost:         0,
        laborCode:    "",
        quantity:     0,
        isBillable:   false,
        isWarranty:   false,
        netsuiteId:   part.netsuiteId
      });
    }

    $scope.removePart = function (part) {
      var index = $scope.workorder.parts.indexOf(part);
      $scope.workorder.parts.splice(index, 1);
    };

    $scope.openErrorModal = function (modalUrl){
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ErrorCtrl'
      });
    };

    $scope.openConfirmationModal = function (modalUrl){
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ConfirmationCtrl'
      });

      $uibModalInstance.result.then(function (){
        //$scope.allowSubmit = true;
        $scope.highMileageConfirm = true;
        $scope.save();
      });
    };

    $scope.openLeaseNotes = function (){
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woLeaseNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function (){
            return $scope.workorder.misc.leaseNotes;
          }
        }
      });

      $uibModalInstance.result.then(function (notes){
        $scope.workorder.misc.leaseNotes = notes;
      });
    };

    $scope.openUnitNotes = function (){
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woUnitNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function (){
            return $scope.workorder.misc.unitNotes;
          }
        }
      });

      $uibModalInstance.result.then(function (notes){
        $scope.workorder.misc.unitNotes = notes;
      });
    };

    $scope.openJSA = function (){
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woJsaModal.html',
        controller: 'JsaModalCtrl',
        windowClass: 'jsa-modal',
        resolve: {
          jsa: function (){
            return $scope.workorder.jsa;
          }
        }
      });

      $uibModalInstance.result.then(function (jsa){
        $scope.workorder.jsa = jsa;
      });
    };

    $scope.openManualPartModal = function (){
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/woManualAddModal.html',
        controller: 'AddPartModalCtrl'
      });

      $uibModalInstance.result.then(function (part){
        $scope.workorder.parts.push({
          vendor: part.vendor,
          number: part.number,
          description: part.description,
          cost: part.cost,
          laborCode: "",
          quantity: 0,
          isBillable: false,
          isWarranty: false,
          isManual: true
        });
      });
    };

    $scope.getUsedLaborCodes();

    $scope.getTimeElapsed();

    $scope.getTotalLaborTime();

    $scope.getUnaccountedTime();
}]);

angular.module('WorkOrderApp.Controllers').controller('NotesModalCtrl',
function ( $scope, $uibModalInstance, notes){
  $scope.notes = notes;

  $scope.ok = function (){
    $uibModalInstance.close($scope.notes);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaModalCtrl',
function ( $scope, $uibModalInstance, jsa ){
  $scope.jsa = jsa;

  $scope.ok = function (){
    $uibModalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('AddPartModalCtrl',
function ( $scope, $uibModalInstance){
  $scope.part = {};

  $scope.addPart = function (){
    $uibModalInstance.close($scope.part);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
function ($scope, $uibModalInstance){
  $scope.ok = function (){
    $uibModalInstance.close();
  };
});

angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
function ($scope, $uibModalInstance){
  $scope.confirm = function (){
    $uibModalInstance.close(true);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('WorkOrderIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders',
function ($scope, $route, $location, AlertService, LoaderService, workorders) {

  $scope.title = "Work Orders";

  $scope.workorders = workorders;

  $scope.fixCustomerName = function (){
    angular.forEach($scope.workorders, function (wo){
      if(!wo.customerName) wo.customerName = '';
    });
  };
  $scope.fixCustomerName();

  $scope.columns = [
    {title: "Unit", objKey: "unitNumber"},
    {title: "Customer", objKey: "customerName"},
    {title: "Date", objKey: "timeStarted"},
    {title: "Technician Id", objKey: "techId"}
  ];

  $scope.clickWorkOrder = function () {
        var wo = this.workorder;
        $scope.selected = wo;
        console.log(wo);

        $location.url('/workorder/review/' + wo._id);
      };

}]);

// var app = angular.module('WorkOrderApp');
//
// app.controller('WorkOrderModalCtrl',
//   ['$scope', '$element', 'title', 'close',
//   function ($scope, $element, title, close){
//     $scope.leaseNotes = null;
//     $scope.title = title;
//
//     $scope.close = function () {
//       close({
//         leaseNotes: $scope.leaseNotes
//       }, 500);
//     };
//
//     $scope.cancel = function (){
//       $element.modal('hide');
//
//       close({
//       leaseNotes: $scope.leaseNotes
//       }, 500);
//     };
// }]);
//
// // angular.module('WorkOrderApp.Controllers').controller('WorkOrderModalCtrl',
// // ['$window', '$scope', '$location', '$element', 'title', 'close',
// // function ($window, $scope, $location, $element, title, close){
// //
// //   $scope.leaseNotes = null;
// //   $scope.title = title;
// //
// //   $scope.close = function (){
// //     close({
// //       leaseNotes: $scope.leaseNotes
// //     }, 500);
// //   };
// //
// //   $scope.cancel = function (){
// //     $element.modal('hide');
// //
// //     close({
// //       leaseNotes: $scope.leaseNotes
// //     }, 500);
// //   };
// // }]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderResumeOrCreateCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders',
function ($scope, $route, $location, AlertService, LoaderService, workorders) {

  console.log("resumeorcreate");

  var resumeWorkOrderId = null;
  workorders.forEach(function (ele) {
    if (ele.timeSubmitted === null) { resumeWorkOrderId = ele._id; }
  });
  $location.path("/workorder/edit/" + (resumeWorkOrderId || ""));
  
}]);

angular.module('WorkOrderApp.Controllers').controller('WorkOrderReviewCtrl', ['$window', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'ReviewNotes','EditHistories', 'workorder', 'reviewNotes', 'editHistories', 'users', 'me', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, WorkOrders, ReviewNotes, EditHistories, workorder, reviewNotes, editHistories, users, me, applicationtypes) {
    $scope.message = "Review Work Order";

    $scope.workorder = workorder;
    $scope.reviewNotes = reviewNotes;
    $scope.editHistories = editHistories;
    $scope.users = users;
    $scope.me = me;
    $scope.hours = getHours();
    $scope.minutes = getMinutes();

    if($cookies.get('role') === "admin") { $scope.editable = true; }
    else { $scope.editable = false; }

    $scope.SyncedToNetsuite = $scope.workorder.timeSynced || $scope.workorder.updated_at;
    // need this to be viewed on review
    $scope.applicationtypes = applicationtypes;

    $scope.workorderTypes1 = ['Corrective', 'Trouble Call'];
    $scope.workorderTypes2 = ['New Set', 'Release', 'Indirect'];

    // FORMAT TIME
    $scope.totalLaborTime = TimeDisplayService.timeManager($scope.workorder.totalWoTime.hours, $scope.workorder.totalWoTime.minutes);

    // return user object from id
    function getUser(id) {
      for (var i = 0; i < $scope.users.length; i++) {
        if ($scope.users[i].username === id) {
          return $scope.users[i];
        }
      }
    }

    $scope.usedLaborCodes = [];

    $scope.getUsedLaborCodes = function () {
      angular.forEach($scope.workorder.laborCodes, function (lc) {
        angular.forEach(lc, function (code) {
          if (code.hours > 0 || code.minutes > 0) {
            if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
              $scope.usedLaborCodes.push(code.text);
            }
          }
        });
      });
      $timeout(function () {
        $scope.getUsedLaborCodes();
      }, 300);
    };

    function getHours() {
      var hours = [];
      var i = 0;
      while (i <= 24) {
        hours.push(i);
        i++;
      }
      return hours;
    }

    function getMinutes() {
      var minutes = [];
      var i = 0;
      while (i < 60) {
        minutes.push(i);
        i += 15;
      }
      return minutes;
    }

    $scope.edit = function () {
      $location.path("/workorder/edit/" + $scope.workorder._id);
    };

    //NOTES
    // init display notes with an empty array.
    $scope.displayNotes = [];
    // the schema is described here for that empty array to be filled with these objects.
    function ClassDisplayNote() {
      return {
        firstname: '',
        lastname: '',
        note: '',
        workOrder: null,
        updated_at: Date
      };
    }

    // load all notes that are in the database.
    _.map($scope.reviewNotes, function (comment) {
      // make sure there is even a comment to look at and that it matches up with this workorder
      if ($scope.workorder._id === comment.workOrder) {
        var thisUser = getUser(comment.user);
        var thisNote = ClassDisplayNote();
        thisNote.firstname = thisUser.firstName;
        thisNote.lastname = thisUser.lastName;
        thisNote.note = comment.note;
        thisNote.updated_at = comment.updated_at;
        $scope.displayNotes.push(thisNote);
      }
    });
    //-------------------------------------------------------------------------
    // create single object to hold single note to push to the database and the display array if saved correctly.

    // create object model to data bind comment input to.
    $scope.comment = ClassNote();
    // create model object to work off of
    function ClassNote() {
      return {
        note: '',
        workOrder: $scope.workorder._id
      };
    }

    // boolean value to keep from editing note while it is sending
    $scope.sendingNote = false;
    // save the new note to the database
    $scope.newNote = function () {
      // save to database will go here only if comment was filled
      if ($scope.comment.note) {
        $scope.sendingNote = true;
        // save to database
        console.log("Saving new note...");
        ReviewNotes.save({}, $scope.comment,
          function (response) {
            $scope.sendingNote = false;
            console.log(response);
            console.log("Successful save.");
            // save note to display.
            var displayNote = ClassDisplayNote();
            displayNote.firstname = $scope.me.firstName;
            displayNote.lastname = $scope.me.lastName;
            displayNote.note = $scope.comment.note;
            displayNote.updated_at = response.updated_at;
            $scope.displayNotes.unshift(displayNote);
            // clear display note from form
            $scope.comment.note = null;
          },
          function (err) {
            $scope.sendingNote = false;
            console.log(err);
            console.log("Error Saving Note.");
            $scope.comment.note = null;
          }
        );
      }
    };
    //-----------------------------------------------------------------------
    // Submissions
    // make the display for all submission history
    $scope.displaySubmissions = [];

    //create display class for Submissions
    function ClassSubmission() {
      return {
        type: '',
        firstname: '',
        lastname: '',
        submissionTime: Date
      };
    }

    // only do if tech has submitted wo.
    if ($scope.workorder.timeSubmitted) {
      // Tech Submission
      var thisUser = getUser($scope.workorder.techId);
      var techSubmission = ClassSubmission();
      techSubmission.type = "Submission";
      techSubmission.firstname = thisUser.firstName;
      techSubmission.lastname = thisUser.lastName;
      techSubmission.submissionTime = $scope.workorder.timeSubmitted;
      $scope.displaySubmissions.push(techSubmission);
      // Manager Review
      if ($scope.workorder.timeApproved) {
        thisUser = getUser($scope.workorder.approvedBy);
        var managerSubmission = ClassSubmission();
        managerSubmission.type = "Reviewed";
        managerSubmission.firstname = thisUser.firstName;
        managerSubmission.lastname = thisUser.lastName;
        managerSubmission.submissionTime = $scope.workorder.timeApproved;
        $scope.displaySubmissions.push(managerSubmission);
      }
      // ADMIN SYNC
      if ($scope.workorder.timeSynced) {
        thisUser = getUser($scope.workorder.syncedBy);
        var adminSubmission = ClassSubmission();
        adminSubmission.type = "Synced";
        adminSubmission.firstname = thisUser.firstName;
        adminSubmission.lastname = thisUser.lastName;
        adminSubmission.submissionTime = $scope.workorder.timeSynced;
        $scope.displaySubmissions.push(adminSubmission);
      }
    }
    //-----------------------------------------------------------------------
    // History Changes
    // create the view for all edits
    $scope.displayChanges = [];

    function ClassDisplayHistory() {
      return {
        panelName: '',
        itemName: '',
        type: '',
        before: '',
        after: ''
      };
    }

    // load all edits from the database
    _.map($scope.editHistories, function (edit) {
      // format the data correctly for presentation.
      if ($scope.workorder._id === edit.workOrder) {
        var thisEdit = ClassDisplayHistory();
        thisEdit.panelName = edit.path[0];
        thisEdit.itemName = edit.path.pop();
        thisEdit.type = edit.editType;
        thisEdit.before = edit.before;
        thisEdit.after = edit.after;
        $scope.displayChanges.push(thisEdit);
      }
    });

    // load the username of the admin who made the edits. and get the count
    if ($scope.editHistories.length !== 0) {
      $scope.editor = getUser($scope.editHistories.pop().user);
      $scope.editCount = $scope.editHistories.length + 1;
    }

    //-----------------------------------------------------------------------

    $scope.removePart = function (part) {
      var index = $scope.workorder.parts.indexOf(part);
      $scope.workorder.parts.splice(index, 1);
    };

    $scope.openLeaseNotes = function () {
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woLeaseNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function () {
            return $scope.workorder.misc.leaseNotes;
          }
        }
      });

      $uibModalInstance.result.then(function (notes) {
        $scope.workorder.misc.leaseNotes = notes;
      });
    };

    $scope.openUnitNotes = function () {
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woUnitNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function () {
            return $scope.workorder.misc.unitNotes;
          }
        }
      });

      $uibModalInstance.result.then(function (notes) {
        $scope.workorder.misc.unitNotes = notes;
      });
    };

    $scope.openJSA = function () {
      var $uibModalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woJsaModal.html',
        controller: 'JsaModalCtrl',
        windowClass: 'jsa-modal',
        resolve: {
          jsa: function () {
            return $scope.workorder.jsa;
          }
        }
      });

      $uibModalInstance.result.then(function (jsa) {
        $scope.workorder.jsa = jsa;
      });
    };
          console.log($scope.workorder);
    $scope.submit = function () {
      console.log("Submitting...");
      if (($cookies.get('role') === "manager" || $cookies.get('role') === "admin") && (!$scope.workorder.managerApproved || !$scope.workorder.timeApproved)) {
        console.log($scope.workorder);
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            console.log(response);
            AlertService.add("success", "Successfully submitted for admin approval.");
            $location.path("/myaccount");
          },
          function (err) {
            console.log(err);
            AlertService.add("danger", "An error occurred while attempting to submit.");
          }
        );
      } else if ($cookies.get('role') === "admin" && $scope.workorder.managerApproved) {
        if($scope.workorder.type !== 'Indirect'){
          $scope.workorder.netsuiteSyned = true;
          WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
            function (response) {
              console.log(response);
              AlertService.add("success", "Successfully synced to netsuite.");
              $location.path("/myaccount");
            },
            function (err) {
              console.log(err);
              $scope.workorder.netsuiteSyned = false;
              AlertService.add("danger", "An error occurred while attempting to sync.");
            }
          );
        } else { // move indirect wo into netsuite synced group without actually syncing to netsuite
          $scope.workorder.netsuiteSyned = true;
          $scope.workorder.syncedBy = $scope.me.username;
          $scope.workorder.timeSynced = new Date();
          WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
            function (response) {
              console.log(response);
              AlertService.add("success", "Successfully saved Indirect work order, not synced to Netsuite.");
              $location.path("/myaccount");
            },
            function (err) {
              console.log(err);
             $scope.workorder.netsuiteSyned = false;
              AlertService.add("danger", "An error occurred while attempting to save work order.");
            }
          )
        }
      }
    };
    $scope.getUsedLaborCodes();
  }
]);

angular.module('WorkOrderApp.Controllers').controller('NotesModalCtrl',
function ( $scope, $uibModalInstance, notes){
  $scope.notes = notes;

  $scope.ok = function (){
    $uibModalInstance.close($scope.notes);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaModalCtrl',
function ( $scope, $uibModalInstance, jsa ){
  $scope.jsa = jsa;

  $scope.ok = function (){
    $uibModalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

/**
 * Created by marcusjwhelan on 10/20/16.
 */
angular.module('WorkOrderApp.Directives')
.directive('pesCollectionMatch', function(){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl){
      // validity setters.
      var setInvalid = function(arg){
        ctrl.$setValidity( arg, false);
        if(elem.parent().hasClass('has-success')){
          elem.parent().removeClass('has-success');
          elem.parent().addClass('has-error');
        } else {
          elem.parent().addClass('has-error');
        }
      };
      var setValid = function(arg){
        ctrl.$setValidity( arg, true );
        if(elem.parent().hasClass('has-error')){
          elem.parent().removeClass('has-error');
          elem.parent().addClass('has-success');
        } else {
          elem.parent().addClass('has-success');
        }
      };

      var arrayOfArrays = [scope.unitNumberArray, scope.unitCustomerArray, scope.unitLocationArray,scope.unitCountiesArray, scope.unitStateArray];

      // runs on page load and on item selection.
      scope.$watch(attr.ngModel, _.debounce(function(viewValue){
        scope.$apply(function(){
          var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
          var index = scope.unitNumberArray.indexOf(scope.workorder.header.unitNumber);

          var checkUnitFields = function(){
            // get the index of the unit number out of the array
            switch(attribute){
              case "header.unitNumber":
                if(arrayOfArrays[0][index] !== scope.workorder.header.unitNumber){
                  setInvalid('header.unitNumber');
                } else {
                  setValid('header.unitNumber');
                }
                break;
              case "header.customerName":
                // customer
                if(arrayOfArrays[1][index] !== scope.workorder.header.customerName){
                  setInvalid('header.customerName');
                } else { // otherwise set set valid and no errors
                  setValid('header.customerName');
                }
                break;
              case "header.leaseName":
                // lease
                if(arrayOfArrays[2][index] != scope.workorder.header.leaseName){
                  setInvalid('header.leaseName');
                } else {
                  setValid('header.leaseName');
                }
                break;
              case "header.county":
                // county
                if(arrayOfArrays[3][index] !== scope.workorder.header.county){
                  setInvalid('header.county');
                } else {
                  setValid('header.county');
                }
                break;
              case "header.state":
                // state
                if(arrayOfArrays[4][index] !== scope.workorder.header.state){
                  setInvalid('header.state');
                } else {
                  setValid('header.state');
                }
                break;
            }
          };

          // Here get the
          var attributeArray = [];
          switch(attribute){
            case "header.unitNumber": attributeArray = scope.unitNumberArray;
              break;
            case "header.customerName": attributeArray = scope.customersArray;
              break;
            case "header.leaseName": attributeArray = scope.unitLocationArray;
              break;
            case "header.county": attributeArray = scope.countiesArray;
              break;
            case "header.state": attributeArray = scope.statesArray;
              break;
          }

          // if empty don't set has-error
          if(viewValue){
            scope.check = (attributeArray.indexOf(viewValue) !== -1) ? 'valid' : undefined;
            if(scope.check){
              if(attribute === "header.unitNumber") scope.unitValid = true;
              console.log(scope.unitValid);
              // if the unit is valid then check all other header values to match.
              if(scope.unitValid === true){
                checkUnitFields();
              } else {
                setValid(attribute);
              }
              return viewValue;
            } else {
              setInvalid(attribute);
              if(attribute === "header.unitNumber") scope.unitValid = false;
              return viewValue;
            }
          }
        })
      },300)); // 300 ms wait. Don't do it every change
    }
  };
})
.directive('unitInput', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/unitInput.html',
    scope: false
  };
}]);


angular.module('PartApp.Controllers').controller('PartsVendorPartsCtrl',
['$scope', '$location', 'AlertService', 'VendorParts',
function ($scope, $location, AlertService, VendorParts) {

  // Adds the current part to the table and empties out the new part form.
  $scope.addNewVendorPart = function () {
    var vp = $scope.newVendorPart;

    // we need to pull the name off of the vendor for UI reasons
    var vendorName = $scope.vendors.filter(function (v) {
      return v._id === vp.VendorId;
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
    var id = removedPart[0]._id;
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
    var id = $scope.part.vendorParts[index]._id;
    console.log(id);
    $location.path("/vendorpart/edit/" + id);
  };

  $scope.emptyVendorPart = function () {
    return {
      PartId: $scope.part._id,
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

angular.module('InventoryTransferApp.Directives')

.directive('inventoryTransferDetails', [ function (){
  return{
    restrict: 'E',
    templateUrl: 'lib/public/angular/apps/inventorytransfer/views/edit/inventorytransferDetails.html',
    scope: true
  };
}]);

angular.module('InventoryTransferApp.Directives')

.directive('partsList', [function (){
  return{
    restrict: 'E',
    templateUrl: 'lib/public/angular/apps/inventorytransfer/views/edit/partslist.html',
    scope: true
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferComments', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferComments.html',
    scope: true
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferDestination', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferDestination.html',
    scope: true
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferOrigin', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferOrigin.html',
    scope: true
  };
}]);

angular.module('TransferApp.Directives')

.directive('transferDetails', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferDetails.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderComments', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/woComments.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderEmissionsReadings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/woEmissionsReadings.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderHistory', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/woHistory.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderUnitReadings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/woUnitReadings.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewComments', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woComments.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewEmissionsReadings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woEmissionsReadings.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewHistory', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woHistory.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewUnitReadings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woUnitReadings.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderBasicLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woBasicLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderCompressorLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woCompressorLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderCoolerLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woCoolerLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderEmissionsLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woEmissionsLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderEngineLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woEngineLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderPanelLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woPanelLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderVesselLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woVesselLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderLaborCodes', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/workorderLaborCodes.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderBilling', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woBilling.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('editDataHistory', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woDataHistory.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderHeading', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woHeading.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderMisc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woMisc.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('editNotes', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woNotes.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderOwnership', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woOwnership.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderType', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woType.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderHeader', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/workorderheader.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderPartsAdd', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/woPartsAdd.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderPartsList', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/woPartsList.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderParts', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/workorderParts.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderEngineChecks', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woEngineChecks.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderEngineCompression', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woEngineCompression.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderGeneralChecks', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woGeneralChecks.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderKillSettings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woKillSettings.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderPmMisc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woPMMisc.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('workorderPm', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woPM.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewBasicLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woBasicLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewCompressorLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woCompressorLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewCoolerLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woCoolerLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewEmissionsLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woEmissionsLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewEngineLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woEngineLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewPanelLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woPanelLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewVesselLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woVesselLC.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewLaborCodes', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/workorderLaborCodes.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewBilling', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woBilling.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewHeading', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woHeading.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewDataHistory', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woDataHistory.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewInfo', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woInfo.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewMisc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woMisc.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewNotes', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woNotes.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewOwnership', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woOwnership.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewType', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woType.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewHeader', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/workorderheader.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewEngineChecks', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woEngineChecks.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewEngineCompression', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woEngineCompression.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewGeneralChecks', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woGeneralChecks.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewKillSettings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woKillSettings.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewPmMisc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woPMMisc.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewPm', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woPM.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewPartsAdd', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/parts/woPartsAdd.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewPartsList', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/parts/woPartsList.html',
    scope: true
  };
}]);

angular.module('WorkOrderApp.Directives')

.directive('reviewParts', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/parts/workorderParts.html',
    scope: true
  };
}]);

/*
 *
 * Copyright (c) 2006-2014 Sam Collett (http://www.texotela.co.uk)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version 1.4
 * Demo: http://www.texotela.co.uk/code/jquery/numeric/
 *
 */
(function ($) {
/*
 * Allows only valid characters to be entered into input boxes.
 * Note: fixes value when pasting via Ctrl+V, but not when using the mouse to paste
  *      side-effect: Ctrl+A does not work, though you can still use the mouse to select (or double-click to select all)
 *
 * @name     numeric
 * @param    config      { decimal : "." , negative : true }
 * @param    callback     A function that runs if the number is not valid (fires onblur)
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @example  $(".numeric").numeric();
 * @example  $(".numeric").numeric(","); // use , as separator
 * @example  $(".numeric").numeric({ decimal : "," }); // use , as separator
 * @example  $(".numeric").numeric({ negative : false }); // do not allow negative values
 * @example  $(".numeric").numeric(null, callback); // use default values, pass on the 'callback' function
 *
 */
$.fn.numeric = function (config, callback)
{
	if(typeof config === 'boolean')
	{
		config = { decimal: config };
	}
	config = config || {};
	// if config.negative undefined, set to true (default is to allow negative numbers)
	if(typeof config.negative == "undefined") { config.negative = true; }
	// set decimal point
	var decimal = (config.decimal === false) ? "" : config.decimal || ".";
	// allow negatives
	var negative = (config.negative === true) ? true : false;
	// callback function
	callback = (typeof(callback) == "function" ? callback : function () {});
	// set data and methods
	return this.data("numeric.decimal", decimal).data("numeric.negative", negative).data("numeric.callback", callback).keypress($.fn.numeric.keypress).keyup($.fn.numeric.keyup).blur($.fn.numeric.blur);
};

$.fn.numeric.keypress = function (e)
{
	// get decimal character and determine if negatives are allowed
	var decimal = $.data(this, "numeric.decimal");
	var negative = $.data(this, "numeric.negative");
	// get the key that was pressed
	var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
	// allow enter/return key (only when in an input box)
	if(key == 13 && this.nodeName.toLowerCase() == "input")
	{
		return true;
	}
	else if(key == 13)
	{
		return false;
	}
	var allow = false;
	// allow Ctrl+A
	if((e.ctrlKey && key == 97 /* firefox */) || (e.ctrlKey && key == 65) /* opera */) { return true; }
	// allow Ctrl+X (cut)
	if((e.ctrlKey && key == 120 /* firefox */) || (e.ctrlKey && key == 88) /* opera */) { return true; }
	// allow Ctrl+C (copy)
	if((e.ctrlKey && key == 99 /* firefox */) || (e.ctrlKey && key == 67) /* opera */) { return true; }
	// allow Ctrl+Z (undo)
	if((e.ctrlKey && key == 122 /* firefox */) || (e.ctrlKey && key == 90) /* opera */) { return true; }
	// allow or deny Ctrl+V (paste), Shift+Ins
	if((e.ctrlKey && key == 118 /* firefox */) || (e.ctrlKey && key == 86) /* opera */ ||
	  (e.shiftKey && key == 45)) { return true; }
	// if a number was not pressed
	if(key < 48 || key > 57)
	{
	  var value = $(this).val();
		/* '-' only allowed at start and if negative numbers allowed */
		if($.inArray('-', value.split('')) !== 0 && negative && key == 45 && (value.length === 0 || parseInt($.fn.getSelectionStart(this), 10) === 0)) { return true; }
		/* only one decimal separator allowed */
		if(decimal && key == decimal.charCodeAt(0) && $.inArray(decimal, value.split('')) != -1)
		{
			allow = false;
		}
		// check for other keys that have special purposes
		if(
			key != 8 /* backspace */ &&
			key != 9 /* tab */ &&
			key != 13 /* enter */ &&
			key != 35 /* end */ &&
			key != 36 /* home */ &&
			key != 37 /* left */ &&
			key != 39 /* right */ &&
			key != 46 /* del */
		)
		{
			allow = false;
		}
		else
		{
			// for detecting special keys (listed above)
			// IE does not support 'charCode' and ignores them in keypress anyway
			if(typeof e.charCode != "undefined")
			{
				// special keys have 'keyCode' and 'which' the same (e.g. backspace)
				if(e.keyCode == e.which && e.which !== 0)
				{
					allow = true;
					// . and delete share the same code, don't allow . (will be set to true later if it is the decimal point)
					if(e.which == 46) { allow = false; }
				}
				// or keyCode != 0 and 'charCode'/'which' = 0
				else if(e.keyCode !== 0 && e.charCode === 0 && e.which === 0)
				{
					allow = true;
				}
			}
		}
		// if key pressed is the decimal and it is not already in the field
		if(decimal && key == decimal.charCodeAt(0))
		{
			if($.inArray(decimal, value.split('')) == -1)
			{
				allow = true;
			}
			else
			{
				allow = false;
			}
		}
	}
	else
	{
		allow = true;
	}
	return allow;
};

$.fn.numeric.keyup = function (e)
{
	var val = $(this).val();
	if(val && val.length > 0)
	{
		// get carat (cursor) position
		var carat = $.fn.getSelectionStart(this);
		var selectionEnd = $.fn.getSelectionEnd(this);
		// get decimal character and determine if negatives are allowed
		var decimal = $.data(this, "numeric.decimal");
		var negative = $.data(this, "numeric.negative");

		// prepend a 0 if necessary
		if(decimal !== "" && decimal !== null)
		{
			// find decimal point
			var dot = $.inArray(decimal, val.split(''));
			// if dot at start, add 0 before
			if(dot === 0)
			{
				this.value = "0" + val;
				carat++;
            			selectionEnd++;
			}
			// if dot at position 1, check if there is a - symbol before it
			if(dot == 1 && val.charAt(0) == "-")
			{
				this.value = "-0" + val.substring(1);
				carat++;
            			selectionEnd++;
			}
			val = this.value;
		}

		// if pasted in, only allow the following characters
		var validChars = [0,1,2,3,4,5,6,7,8,9,'-',decimal];
		// get length of the value (to loop through)
		var length = val.length;
		// loop backwards (to prevent going out of bounds)
		for(var i = length - 1; i >= 0; i--)
		{
			var ch = val.charAt(i);
			// remove '-' if it is in the wrong place
			if(i !== 0 && ch == "-")
			{
				val = val.substring(0, i) + val.substring(i + 1);
			}
			// remove character if it is at the start, a '-' and negatives aren't allowed
			else if(i === 0 && !negative && ch == "-")
			{
				val = val.substring(1);
			}
			var validChar = false;
			// loop through validChars
			for(var j = 0; j < validChars.length; j++)
			{
				// if it is valid, break out the loop
				if(ch == validChars[j])
				{
					validChar = true;
					break;
				}
			}
			// if not a valid character, or a space, remove
			if(!validChar || ch == " ")
			{
				val = val.substring(0, i) + val.substring(i + 1);
			}
		}
		// remove extra decimal characters
		var firstDecimal = $.inArray(decimal, val.split(''));
		if(firstDecimal > 0)
		{
			for(var k = length - 1; k > firstDecimal; k--)
			{
				var chch = val.charAt(k);
				// remove decimal character
				if(chch == decimal)
				{
					val = val.substring(0, k) + val.substring(k + 1);
				}
			}
		}
		// set the value and prevent the cursor moving to the end
		this.value = val;
		$.fn.setSelection(this, [carat, selectionEnd]);
	}
};

$.fn.numeric.blur = function ()
{
	var decimal = $.data(this, "numeric.decimal");
	var callback = $.data(this, "numeric.callback");
	var val = this.value;
	if(val !== "")
	{
		var re = new RegExp("^\\d+$|^\\d*" + decimal + "\\d+$");
		if(!re.exec(val))
		{
			callback.apply(this);
		}
	}
};

$.fn.removeNumeric = function ()
{
	return this.data("numeric.decimal", null).data("numeric.negative", null).data("numeric.callback", null).unbind("keypress", $.fn.numeric.keypress).unbind("blur", $.fn.numeric.blur);
};

// Based on code from http://javascript.nwbox.com/cursor_position/ (Diego Perini <dperini@nwbox.com>)
$.fn.getSelectionStart = function (o)
{
	if(o.type === "number"){
		return undefined;
	}
	else if (o.createTextRange)
	{
		var r;
        if(typeof document.selection == "undefined") {
            //On IE < 9 && IE >= 11 : "document.selection" is deprecated and you should use "document.getSelection()"
            //https://github.com/SamWM/jQuery-Plugins/issues/62
            r = document.getSelection();
        } else {
            r = document.selection.createRange().duplicate();
            r.moveEnd('character', o.value.length);
        }
		if (r.text == '') return o.value.length;

		return o.value.lastIndexOf(r.text);
	} else {
        try { return o.selectionStart; }
        catch(e) { return 0; }
    }
};

// Based on code from http://javascript.nwbox.com/cursor_position/ (Diego Perini <dperini@nwbox.com>)
$.fn.getSelectionEnd = function (o)
{
	if(o.type === "number"){
		return undefined;
	}
	else if (o.createTextRange) {
		var r = document.selection.createRange().duplicate()
		r.moveStart('character', -o.value.length)
		return r.text.length
	} else return o.selectionEnd
}

// set the selection, o is the object (input), p is the position ([start, end] or just start)
$.fn.setSelection = function (o, p)
{
	// if p is number, start and end are the same
	if(typeof p == "number") { p = [p, p]; }
	// only set if p is an array of length 2
	if(p && p.constructor == Array && p.length == 2)
	{
		if(o.type === "number") {
			o.focus();
		}
		else if (o.createTextRange)
		{
			var r = o.createTextRange();
			r.collapse(true);
			r.moveStart('character', p[0]);
			r.moveEnd('character', p[1]);
			r.select();
		}
		else {
            o.focus();
            try{
                if(o.setSelectionRange)
                {
                    o.setSelectionRange(p[0], p[1]);
                }
            } catch(e) {
            }
        }
	}
};

})(jQuery);

/*!
 * Bootstrap v3.2.0 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function (a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function (b){var c=!1,d=this;a(this).one("bsTransitionEnd",function (){c=!0});var e=function (){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function (){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function (b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function (b){a(b).on("click",c,this.close)};d.VERSION="3.2.0",d.prototype.close=function (b){function c(){f.detach().trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",c).emulateTransitionEnd(150):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function (){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function (b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.2.0",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function (b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),d[e](null==f[b]?this.options[b]:f[b]),setTimeout(a.proxy(function (){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function (){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function (){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function (c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),c.preventDefault()})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function (b,c){this.$element=a(b).on("keydown.bs.carousel",a.proxy(this.keydown,this)),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.2.0",c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},c.prototype.keydown=function (a){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()},c.prototype.cycle=function (b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function (a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.to=function (b){var c=this,d=this.getItemIndex(this.$active=this.$element.find(".item.active"));return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function (){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},c.prototype.pause=function (b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function (){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function (){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function (b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=e[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:g});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,f&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(e)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:g});return a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one("bsTransitionEnd",function (){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function (){i.$element.trigger(m)},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger(m)),f&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function (){return a.fn.carousel=d,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function (c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}}),a(window).on("load",function (){a('[data-ride="carousel"]').each(function (){var c=a(this);b.call(c,c.data())})})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b);!e&&f.toggle&&"show"==b&&(b=!b),e||d.data("bs.collapse",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function (b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};c.VERSION="3.2.0",c.DEFAULTS={toggle:!0},c.prototype.dimension=function (){var a=this.$element.hasClass("width");return a?"width":"height"},c.prototype.show=function (){if(!this.transitioning&&!this.$element.hasClass("in")){var c=a.Event("show.bs.collapse");if(this.$element.trigger(c),!c.isDefaultPrevented()){var d=this.$parent&&this.$parent.find("> .panel > .in");if(d&&d.length){var e=d.data("bs.collapse");if(e&&e.transitioning)return;b.call(d,"hide"),e||d.data("bs.collapse",null)}var f=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[f](0),this.transitioning=1;var g=function (){this.$element.removeClass("collapsing").addClass("collapse in")[f](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return g.call(this);var h=a.camelCase(["scroll",f].join("-"));this.$element.one("bsTransitionEnd",a.proxy(g,this)).emulateTransitionEnd(350)[f](this.$element[0][h])}}},c.prototype.hide=function (){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function (){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},c.prototype.toggle=function (){this[this.$element.hasClass("in")?"hide":"show"]()};var d=a.fn.collapse;a.fn.collapse=b,a.fn.collapse.Constructor=c,a.fn.collapse.noConflict=function (){return a.fn.collapse=d,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function (c){var d,e=a(this),f=e.attr("data-target")||c.preventDefault()||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""),g=a(f),h=g.data("bs.collapse"),i=h?"toggle":e.data(),j=e.attr("data-parent"),k=j&&a(j);h&&h.transitioning||(k&&k.find('[data-toggle="collapse"][data-parent="'+j+'"]').not(e).addClass("collapsed"),e[g.hasClass("in")?"addClass":"removeClass"]("collapsed")),b.call(g,i)})}(jQuery),+function (a){"use strict";function b(b){b&&3===b.which||(a(e).remove(),a(f).each(function (){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))}))}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function d(b){return this.each(function (){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function (b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.2.0",g.prototype.toggle=function (d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function (b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var e=c(d),g=e.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.divider):visible a",i=e.find('[role="menu"]'+h+', [role="listbox"]'+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function (){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function (a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f+', [role="menu"], [role="listbox"]',g.prototype.keydown)}(jQuery),+function (a){"use strict";function b(b,d){return this.each(function (){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function (b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$backdrop=this.isShown=null,this.scrollbarWidth=0,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function (){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.2.0",c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function (a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function (b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.$body.addClass("modal-open"),this.setScrollbar(),this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function (){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(c.$body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one("bsTransitionEnd",function (){c.$element.trigger("focus").trigger(e)}).emulateTransitionEnd(300):c.$element.trigger("focus").trigger(e)}))},c.prototype.hide=function (b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.$body.removeClass("modal-open"),this.resetScrollbar(),this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},c.prototype.enforceFocus=function (){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function (a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function (){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function (a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},c.prototype.hideModal=function (){var a=this;this.$element.hide(),this.backdrop(function (){a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function (){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function (b){var c=this,d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=a.support.transition&&d;if(this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function (a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),e&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;e?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(150):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var f=function (){c.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",f).emulateTransitionEnd(150):f()}else b&&b()},c.prototype.checkScrollbar=function (){document.body.clientWidth>=window.innerWidth||(this.scrollbarWidth=this.scrollbarWidth||this.measureScrollbar())},c.prototype.setScrollbar=function (){var a=parseInt(this.$body.css("padding-right")||0,10);this.scrollbarWidth&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function (){this.$body.css("padding-right","")},c.prototype.measureScrollbar=function (){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function (){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function (c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function (a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function (){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function (a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};c.VERSION="3.2.0",c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function (b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(this.options.viewport.selector||this.options.viewport);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function (){return c.DEFAULTS},c.prototype.getOptions=function (b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function (){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function (a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function (b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function (){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},c.prototype.leave=function (b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function (){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function (){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var c=a.contains(document.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!c)return;var d=this,e=this.tip(),f=this.getUID(this.type);this.setContent(),e.attr("id",f),this.$element.attr("aria-describedby",f),this.options.animation&&e.addClass("fade");var g="function"==typeof this.options.placement?this.options.placement.call(this,e[0],this.$element[0]):this.options.placement,h=/\s?auto?\s?/i,i=h.test(g);i&&(g=g.replace(h,"")||"top"),e.detach().css({top:0,left:0,display:"block"}).addClass(g).data("bs."+this.type,this),this.options.container?e.appendTo(this.options.container):e.insertAfter(this.$element);var j=this.getPosition(),k=e[0].offsetWidth,l=e[0].offsetHeight;if(i){var m=g,n=this.$element.parent(),o=this.getPosition(n);g="bottom"==g&&j.top+j.height+l-o.scroll>o.height?"top":"top"==g&&j.top-o.scroll-l<0?"bottom":"right"==g&&j.right+k>o.width?"left":"left"==g&&j.left-k<o.left?"right":g,e.removeClass(m).addClass(g)}var p=this.getCalculatedOffset(g,j,k,l);this.applyPlacement(p,g);var q=function (){d.$element.trigger("shown.bs."+d.type),d.hoverState=null};a.support.transition&&this.$tip.hasClass("fade")?e.one("bsTransitionEnd",q).emulateTransitionEnd(150):q()}},c.prototype.applyPlacement=function (b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top=b.top+g,b.left=b.left+h,a.offset.setOffset(d[0],a.extend({using:function (a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=k.left?2*k.left-e+i:2*k.top-f+j,m=k.left?"left":"top",n=k.left?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(l,d[0][n],m)},c.prototype.replaceArrow=function (a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},c.prototype.setContent=function (){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function (){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.removeAttr("aria-describedby"),this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one("bsTransitionEnd",b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},c.prototype.fixTitle=function (){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function (){return this.getTitle()},c.prototype.getPosition=function (b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName;return a.extend({},"function"==typeof c.getBoundingClientRect?c.getBoundingClientRect():null,{scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop(),width:d?a(window).width():b.outerWidth(),height:d?a(window).height():b.outerHeight()},d?{top:0,left:0}:b.offset())},c.prototype.getCalculatedOffset=function (a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function (a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.width&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function (){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function (a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function (){return this.$tip=this.$tip||a(this.options.template)},c.prototype.arrow=function (){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.validate=function (){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},c.prototype.enable=function (){this.enabled=!0},c.prototype.disable=function (){this.enabled=!1},c.prototype.toggleEnabled=function (){this.enabled=!this.enabled},c.prototype.toggle=function (b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function (){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function (){return a.fn.tooltip=d,this}}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function (a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.2.0",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function (){return c.DEFAULTS},c.prototype.setContent=function (){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").empty()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function (){return this.getTitle()||this.getContent()},c.prototype.getContent=function (){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function (){return this.$arrow=this.$arrow||this.tip().find(".arrow")},c.prototype.tip=function (){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function (){return a.fn.popover=d,this}}(jQuery),+function (a){"use strict";function b(c,d){var e=a.proxy(this.process,this);this.$body=a("body"),this.$scrollElement=a(a(c).is("body")?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",e),this.refresh(),this.process()}function c(c){return this.each(function (){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.2.0",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function (){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function (){var b="offset",c=0;a.isWindow(this.$scrollElement[0])||(b="position",c=this.$scrollElement.scrollTop()),this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight();var d=this;this.$body.find(this.selector).map(function (){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+c,e]]||null}).sort(function (a,b){return a[0]-b[0]}).each(function (){d.offsets.push(this[0]),d.targets.push(this[1])})},b.prototype.process=function (){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function (b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function (){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function (){a('[data-spy="scroll"]').each(function (){var b=a(this);c.call(b,b.data())})})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function (b){this.element=a(b)};c.VERSION="3.2.0",c.prototype.show=function (){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.closest("li"),c),this.activate(g,g.parent(),function (){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},c.prototype.activate=function (b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one("bsTransitionEnd",e).emulateTransitionEnd(150):e(),f.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function (){return a.fn.tab=d,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function (c){c.preventDefault(),b.call(a(this),"show")})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function (b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.2.0",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getPinnedOffset=function (){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function (){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function (){if(this.$element.is(":visible")){var b=a(document).height(),d=this.$target.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=b-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){null!=this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:b-this.$element.height()-h}))}}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function (){return a.fn.affix=d,this},a(window).on("load",function (){a('[data-spy="affix"]').each(function (){var c=a(this),d=c.data();d.offset=d.offset||{},d.offsetBottom&&(d.offset.bottom=d.offsetBottom),d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);

angular.module('Orion.Controllers', []);
angular.module('Orion.Components', []);
angular.module('Orion.Directives', []);
angular.module('Orion.Services', ['ngRoute', 'ngResource', 'ngCookies' ]);

angular.module('Orion', [
  'CommonControllers',
  'CommonComponents',
  'CommonDirectives',
  'CommonServices',
  'Orion.Controllers',
  'Orion.Directives',
  'Orion.Services',
  'AreaApp',
  'CompressorApp',
  'CountyApp',
  'CustomerApp',
  'EngineApp',
  'InventoryTransferApp',
  'PartApp',
  'PartOrderApp',
  'SupportApp',
  'TransferApp',
  'UnitApp',
  'UserApp',
  'VendorApp',
  'WorkOrderApp',
  'ui.bootstrap',
  'ui.utils',
  'satellizer'
  ]);

  angular.module('Orion').config(['$routeProvider', '$authProvider',
    function ($routeProvider, $authProvider) {
      $routeProvider
      .when('/login', {
        controller: 'SessionCtrl',
        templateUrl: '/lib/public/angular/views/redirecting.html',
      })
      .when('/myaccount', {
        needsLogin: true,
        controller: 'MyAccountCtrl',
        templateUrl: '/lib/public/angular/views/myaccount.html'
      })
      .when('/example', {
        controller: 'ExampleCtrl',
        templateUrl: '/lib/public/angular/views/example.html'
      })
      .when('/', {
        controller: 'SessionCtrl',
        templateUrl: '/lib/public/angular/views/clientLogin.html'
      });
      // .when('/', {
      //   controller: 'HomepageCtrl',
      //   templateUrl: '/lib/public/angular/views/homepage.html'
      // });
      $authProvider.google({
        url: '/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri: window.location.origin,
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display'],
        scope: ['profile', 'email'],
        scopePrefix: 'openid',
        scopeDelimiter: ' ',
        display: 'popup',
        type: '2.0',
        popupOptions: { width: 452, height: 633 },
        clientId: '402483966217-5crk767d69pcn25dhds4htv3o67kdpuc.apps.googleusercontent.com',
        responseType: 'token'
      });
      $authProvider.httpInterceptor = function() { return true; };
      $authProvider.withCredentials = true;
      $authProvider.tokenRoot = null;
      $authProvider.baseUrl = '/';
      $authProvider.loginUrl = '/auth/login';
      $authProvider.signupUrl = '/auth/signup';
      $authProvider.unlinkUrl = '/auth/unlink/';
      $authProvider.tokenName = 'token';
      $authProvider.tokenPrefix = 'satellizer';
      $authProvider.authHeader = 'Authorization';
      $authProvider.authToken = 'Bearer';
      $authProvider.storageType = 'localStorage';
    }
  ]);


  /* Handle errors from the server side
  ----------------------------------------------------------------------------- */
  // angular.module('Orion').config(['$httpProvider',
  // function ($httpProvider) {
  //   $httpProvider.interceptors.push('Handler401');
  // }]);
