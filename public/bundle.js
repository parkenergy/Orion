angular.module('CommonControllers', []);
angular.module('CommonDirectives', []);
angular.module('CommonServices', ['ngRoute', 'ngResource', 'ngCookies']);

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
          text: "User: " + $cookies.tech || "Logged Out",
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

      if($cookies.role === "admin"){
        $scope.approved = true;
      }
      if($cookies.role === "manager"){
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
        $window.open('#/workorder/review/' + this.workorder._id, '_blank');
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

    $scope.clickWorkOrder = function () {
        var wo = this.workorder;
        $scope.selected = wo;
        console.log(wo);

        $location.url('/workorder/review/' + wo._id);
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

  $cookies.tech = "Logged Out";
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
            $cookies.tech = res.data.username || "Logged Out";
            $cookies.role = res.data.role;
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

    if ($cookies.userId !== null &&
        $cookies.userId !== undefined &&
        $cookies.userId !== 0 &&
        $cookies.userId !== "undefined") {
          deferred.resolve($cookies.userId);
    } else {

      httpService.get('/authorized').success(function (user) {
        if (user !== '0' && user !== undefined && user !== null && user !== "undefined") {
          $cookies.userId = user._id;
          $cookies.userName = user.userName;
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
.directive('numberField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/numberfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@',
      disabled: '='
    }
  };
}]);

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

angular.module('CommonDirectives')
.directive('selectList', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/selectlist.html',
    scope: {
      labelText: '@',
      data: '=',
      selectField: '@',
      displayField: '@',
      arrayList: '=',
      disabled: '='
    }
  };
}]);

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

angular.module('SupportApp.Controllers').controller('SupportIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'me',
  function ($scope, $route, $location, AlertService, LoaderService, me){
    $scope.me = me;
    $scope.title = "Support";

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
          var checkUnitFields = function(){
            // get the index of the unit number out of the array
            var index = scope.unitNumberArray.indexOf(scope.workorder.header.unitNumber);
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
              // this normally would set validity to true but since the unit number is valid we need to check if it matches the value in a unit.
              if(attribute === "header.unitNumber") scope.unitValid = true;
              console.log(scope.unitValid);
              if(scope.unitValid === true){
                checkUnitFields();
              } else {
                // if it is false then set this field itself as true
                setInvalid(attribute);
              }
              return viewValue;
            } else {
              setInvalid(attribute);
              if(attribute === "header.unitNumber") scope.unitValid = false;
              return viewValue;
            }
          }

          // if unit number is valid check all other unit elements for validity based on that unit number.
          if(scope.unitValid === true){
            checkUnitFields();
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

angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'ReviewNotes', 'EditHistories', 'workorder', 'reviewNotes', 'editHistories', 'units', 'customers', 'users', 'me', 'parts', 'counties', 'states', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $modal, $cookies, AlertService, TimeDisplayService, WorkOrders, ReviewNotes, EditHistories, workorder, reviewNotes, editHistories, units, customers, users, me, parts, counties, states, applicationtypes) {

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
        }

        // needed so on page reload the header stays filled.
        if($scope.workorder.unit){
          $scope.workorder.header.state = $scope.workorder.unit.state.name;
          $scope.workorder.header.county = $scope.workorder.unit.county.name;
          $scope.workorder.header.leaseName = $scope.workorder.unit.locationName;
          $scope.workorder.header.customerName = $scope.workorder.unit.customerName;
          $scope.workorder.header.unitNumber = $scope.workorder.unit.number;
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
    }

    // Triggered on change to specific checkbox but all but PM call this function, if a pm type just set it. if not a pm type make pm false if true then set.
    $scope.typeChange = function(obj){
      if(obj.text === "Corrective" || obj.text === "Trouble Call"){
        $scope.setTypes(obj);
      }else{
        $scope.nonPmType();
        $scope.setTypes(obj);
      }
    }

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
    }

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
        if($cookies.role === "admin"){
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
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ErrorCtrl'
      });
    };

    $scope.openConfirmationModal = function (modalUrl){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ConfirmationCtrl'
      });

      modalInstance.result.then(function (){
        //$scope.allowSubmit = true;
        $scope.highMileageConfirm = true;
        $scope.save();
      });
    };

    $scope.openLeaseNotes = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woLeaseNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function (){
            return $scope.workorder.misc.leaseNotes;
          }
        }
      });

      modalInstance.result.then(function (notes){
        $scope.workorder.misc.leaseNotes = notes;
      });
    };

    $scope.openUnitNotes = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woUnitNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function (){
            return $scope.workorder.misc.unitNotes;
          }
        }
      });

      modalInstance.result.then(function (notes){
        $scope.workorder.misc.unitNotes = notes;
      });
    };

    $scope.openJSA = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woJsaModal.html',
        controller: 'JsaModalCtrl',
        windowClass: 'jsa-modal',
        resolve: {
          jsa: function (){
            return $scope.workorder.jsa;
          }
        }
      });

      modalInstance.result.then(function (jsa){
        $scope.workorder.jsa = jsa;
      });
    };

    $scope.openManualPartModal = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/woManualAddModal.html',
        controller: 'AddPartModalCtrl'
      });

      modalInstance.result.then(function (part){
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
function ( $scope, $modalInstance, notes){
  $scope.notes = notes;

  $scope.ok = function (){
    $modalInstance.close($scope.notes);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaModalCtrl',
function ( $scope, $modalInstance, jsa ){
  $scope.jsa = jsa;

  $scope.ok = function (){
    $modalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('AddPartModalCtrl',
function ( $scope, $modalInstance){
  $scope.part = {};

  $scope.addPart = function (){
    $modalInstance.close($scope.part);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
function ($scope, $modalInstance){
  $scope.ok = function (){
    $modalInstance.close();
  };
});

angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
function ($scope, $modalInstance){
  $scope.confirm = function (){
    $modalInstance.close(true);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
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

angular.module('WorkOrderApp.Controllers').controller('WorkOrderReviewCtrl', ['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'ReviewNotes','EditHistories', 'workorder', 'reviewNotes', 'editHistories', 'users', 'me', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $modal, $cookies, AlertService, TimeDisplayService, WorkOrders, ReviewNotes, EditHistories, workorder, reviewNotes, editHistories, users, me, applicationtypes) {
    $scope.message = "Review Work Order";

    $scope.workorder = workorder;
    $scope.reviewNotes = reviewNotes;
    $scope.editHistories = editHistories;
    $scope.users = users;
    $scope.me = me;
    $scope.hours = getHours();
    $scope.minutes = getMinutes();

    if($cookies.role === "admin") { $scope.editable = true; }
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
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woLeaseNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function () {
            return $scope.workorder.misc.leaseNotes;
          }
        }
      });

      modalInstance.result.then(function (notes) {
        $scope.workorder.misc.leaseNotes = notes;
      });
    };

    $scope.openUnitNotes = function () {
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woUnitNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function () {
            return $scope.workorder.misc.unitNotes;
          }
        }
      });

      modalInstance.result.then(function (notes) {
        $scope.workorder.misc.unitNotes = notes;
      });
    };

    $scope.openJSA = function () {
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woJsaModal.html',
        controller: 'JsaModalCtrl',
        windowClass: 'jsa-modal',
        resolve: {
          jsa: function () {
            return $scope.workorder.jsa;
          }
        }
      });

      modalInstance.result.then(function (jsa) {
        $scope.workorder.jsa = jsa;
      });
    };

    $scope.submit = function () {
      console.log("Submitting...");
      if (($cookies.role === "manager" || $cookies.role === "admin") && (!$scope.workorder.managerApproved || !$scope.workorder.timeApproved)) {
        //$scope.workorder.managerApproved = true;
        console.log($scope.workorder);
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            console.log("Updated!");
            console.log(response);
            AlertService.add("success", "Successfully submitted for admin approval.");
            $location.path("/myaccount");
          },
          function (err) {
            console.log("Error Occured!");
            console.log(err);
            AlertService.add("danger", "An error occurred while attempting to submit.");
          }
        );
      } else if ($cookies.role === "admin" && $scope.workorder.managerApproved) {
        $scope.workorder.netsuiteSyned = true;
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            console.log("Synced!");
            console.log(response);
            AlertService.add("success", "Successfully synced to netsuite.");
            $location.path("/myaccount");
          },
          function (err) {
            console.log("Error Occured!");
            console.log(err);
            $scope.workorder.netsuiteSyned = false;
            AlertService.add("danger", "An error occurred while attempting to sync.");
          }
        );
      }
    };
    $scope.getUsedLaborCodes();
  }
]);

angular.module('WorkOrderApp.Controllers').controller('NotesModalCtrl',
function ( $scope, $modalInstance, notes){
  $scope.notes = notes;

  $scope.ok = function (){
    $modalInstance.close($scope.notes);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaModalCtrl',
function ( $scope, $modalInstance, jsa ){
  $scope.jsa = jsa;

  $scope.ok = function (){
    $modalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

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

/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.12.0-SNAPSHOT - 2014-07-18
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.bindHtml","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.dropdown","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html","template/accordion/accordion.html","template/alert/alert.html","template/carousel/carousel.html","template/carousel/slide.html","template/datepicker/datepicker.html","template/datepicker/day.html","template/datepicker/month.html","template/datepicker/popup.html","template/datepicker/year.html","template/modal/backdrop.html","template/modal/window.html","template/pagination/pager.html","template/pagination/pagination.html","template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html","template/popover/popover-template.html","template/popover/popover.html","template/progressbar/bar.html","template/progressbar/progress.html","template/progressbar/progressbar.html","template/rating/rating.html","template/tabs/tab.html","template/tabs/tabset.html","template/timepicker/timepicker.html","template/typeahead/typeahead-match.html","template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function ($q, $timeout, $rootScope) {

  var $transition = function (element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

    var transitionEndHandler = function (event) {
      $rootScope.$apply(function () {
        element.unbind(endEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function () {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction (trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
        deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function () {
      if ( endEventName ) {
        element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}]);

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', function ($transition) {

    return {
      link: function (scope, element, attrs) {

        var initialAnimSkip = true;
        var currentTransition;

        function doTransition(change) {
          var newTransition = $transition(element, change);
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            // Make sure it's this transition, otherwise, leave it alone.
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          } else {
            element.removeClass('collapse').addClass('collapsing');
            doTransition({ height: element[0].scrollHeight + 'px' }).then(expandDone);
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          element.css({height: 'auto'});
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            element.css({height: 0});
          } else {
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            element.css({ height: element[0].scrollHeight + 'px' });
            //trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = element[0].offsetWidth;

            element.removeClass('collapse in').addClass('collapsing');

            doTransition({ height: 0 }).then(collapseDone);
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }

        scope.$watch(attrs.collapse, function (shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

.constant('accordionConfig', {
  closeOthers: true
})

.controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

  // This array keeps track of the accordion groups
  this.groups = [];

  // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
  this.closeOthers = function (openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
    if ( closeOthers ) {
      angular.forEach(this.groups, function (group) {
        if ( group !== openGroup ) {
          group.isOpen = false;
        }
      });
    }
  };

  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function (groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function (event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function (group) {
    var index = this.groups.indexOf(group);
    if ( index !== -1 ) {
      this.groups.splice(index, 1);
    }
  };

}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('accordion', function () {
  return {
    restrict:'EA',
    controller:'AccordionController',
    transclude: true,
    replace: false,
    templateUrl: 'template/accordion/accordion.html'
  };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('accordionGroup', function () {
  return {
    require:'^accordion',         // We need this directive to be inside an accordion
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'template/accordion/accordion-group.html',
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      isOpen: '=?',
      isDisabled: '=?'
    },
    controller: function () {
      this.setHeading = function (element) {
        this.heading = element;
      };
    },
    link: function (scope, element, attrs, accordionCtrl) {
      accordionCtrl.addGroup(scope);

      scope.$watch('isOpen', function (value) {
        if ( value ) {
          accordionCtrl.closeOthers(scope);
        }
      });

      scope.toggleOpen = function () {
        if ( !scope.isDisabled ) {
          scope.isOpen = !scope.isOpen;
        }
      };
    }
  };
})

// Use accordion-heading below an accordion-group to provide a heading containing HTML
// <accordion-group>
//   <accordion-heading>Heading containing HTML - <img src="..."></accordion-heading>
// </accordion-group>
.directive('accordionHeading', function () {
  return {
    restrict: 'EA',
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    require: '^accordionGroup',
    link: function (scope, element, attr, accordionGroupCtrl, transclude) {
      // Pass the heading to the accordion-group controller
      // so that it can be transcluded into the right place in the template
      // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
      accordionGroupCtrl.setHeading(transclude(scope, function () {}));
    }
  };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
// <div class="accordion-group">
//   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
//   ...
// </div>
.directive('accordionTransclude', function () {
  return {
    require: '^accordionGroup',
    link: function (scope, element, attr, controller) {
      scope.$watch(function () { return controller[attr.accordionTransclude]; }, function (heading) {
        if ( heading ) {
          element.html('');
          element.append(heading);
        }
      });
    }
  };
});

angular.module('ui.bootstrap.alert', [])

.controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
  $scope.closeable = 'close' in $attrs;
}])

.directive('alert', function () {
  return {
    restrict:'EA',
    controller:'AlertController',
    templateUrl:'template/alert/alert.html',
    transclude:true,
    replace:true,
    scope: {
      type: '@',
      close: '&'
    }
  };
});

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
angular.module('ui.bootstrap.buttons', [])

.constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
})

.controller('ButtonsController', ['buttonConfig', function (buttonConfig) {
  this.activeClass = buttonConfig.activeClass || 'active';
  this.toggleEvent = buttonConfig.toggleEvent || 'click';
}])

.directive('btnRadio', function () {
  return {
    require: ['btnRadio', 'ngModel'],
    controller: 'ButtonsController',
    link: function (scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      //model -> UI
      ngModelCtrl.$render = function () {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
      };

      //ui->model
      element.bind(buttonsCtrl.toggleEvent, function () {
        var isActive = element.hasClass(buttonsCtrl.activeClass);

        if (!isActive || angular.isDefined(attrs.uncheckable)) {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.btnRadio));
            ngModelCtrl.$render();
          });
        }
      });
    }
  };
})

.directive('btnCheckbox', function () {
  return {
    require: ['btnCheckbox', 'ngModel'],
    controller: 'ButtonsController',
    link: function (scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      function getTrueValue() {
        return getCheckboxValue(attrs.btnCheckboxTrue, true);
      }

      function getFalseValue() {
        return getCheckboxValue(attrs.btnCheckboxFalse, false);
      }

      function getCheckboxValue(attributeValue, defaultValue) {
        var val = scope.$eval(attributeValue);
        return angular.isDefined(val) ? val : defaultValue;
      }

      //model -> UI
      ngModelCtrl.$render = function () {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
      };

      //ui->model
      element.bind(buttonsCtrl.toggleEvent, function () {
        scope.$apply(function () {
          ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
          ngModelCtrl.$render();
        });
      });
    }
  };
});

/**
* @ngdoc overview
* @name ui.bootstrap.carousel
*
* @description
* AngularJS version of an image carousel.
*
*/
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
.controller('CarouselController', ['$scope', '$timeout', '$transition', function ($scope, $timeout, $transition) {
  var self = this,
    slides = self.slides = $scope.slides = [],
    currentIndex = -1,
    currentTimeout, isPlaying;
  self.currentSlide = null;

  var destroyed = false;
  /* direction: "prev" or "next" */
  self.select = $scope.select = function (nextSlide, direction) {
    var nextIndex = slides.indexOf(nextSlide);
    //Decide direction if it's not given
    if (direction === undefined) {
      direction = nextIndex > currentIndex ? 'next' : 'prev';
    }
    if (nextSlide && nextSlide !== self.currentSlide) {
      if ($scope.$currentTransition) {
        $scope.$currentTransition.cancel();
        //Timeout so ng-class in template has time to fix classes for finished slide
        $timeout(goNext);
      } else {
        goNext();
      }
    }
    function goNext() {
      // Scope has been destroyed, stop here.
      if (destroyed) { return; }
      //If we have a slide to transition from and we have a transition type and we're allowed, go
      if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
        //We shouldn't do class manip in here, but it's the same weird thing bootstrap does. need to fix sometime
        nextSlide.$element.addClass(direction);
        var reflow = nextSlide.$element[0].offsetWidth; //force reflow

        //Set all other slides to stop doing their stuff for the new transition
        angular.forEach(slides, function (slide) {
          angular.extend(slide, {direction: '', entering: false, leaving: false, active: false});
        });
        angular.extend(nextSlide, {direction: direction, active: true, entering: true});
        angular.extend(self.currentSlide||{}, {direction: direction, leaving: true});

        $scope.$currentTransition = $transition(nextSlide.$element, {});
        //We have to create new pointers inside a closure since next & current will change
        (function (next,current) {
          $scope.$currentTransition.then(
            function (){ transitionDone(next, current); },
            function (){ transitionDone(next, current); }
          );
        }(nextSlide, self.currentSlide));
      } else {
        transitionDone(nextSlide, self.currentSlide);
      }
      self.currentSlide = nextSlide;
      currentIndex = nextIndex;
      //every time you change slides, reset the timer
      restartTimer();
    }
    function transitionDone(next, current) {
      angular.extend(next, {direction: '', active: true, leaving: false, entering: false});
      angular.extend(current||{}, {direction: '', active: false, leaving: false, entering: false});
      $scope.$currentTransition = null;
    }
  };
  $scope.$on('$destroy', function () {
    destroyed = true;
  });

  /* Allow outside people to call indexOf on slides array */
  self.indexOfSlide = function (slide) {
    return slides.indexOf(slide);
  };

  $scope.next = function () {
    var newIndex = (currentIndex + 1) % slides.length;

    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (!$scope.$currentTransition) {
      return self.select(slides[newIndex], 'next');
    }
  };

  $scope.prev = function () {
    var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (!$scope.$currentTransition) {
      return self.select(slides[newIndex], 'prev');
    }
  };

  $scope.isActive = function (slide) {
     return self.currentSlide === slide;
  };

  $scope.$watch('interval', restartTimer);
  $scope.$on('$destroy', resetTimer);

  function restartTimer() {
    resetTimer();
    var interval = +$scope.interval;
    if (!isNaN(interval) && interval>=0) {
      currentTimeout = $timeout(timerFn, interval);
    }
  }

  function resetTimer() {
    if (currentTimeout) {
      $timeout.cancel(currentTimeout);
      currentTimeout = null;
    }
  }

  function timerFn() {
    if (isPlaying) {
      $scope.next();
      restartTimer();
    } else {
      $scope.pause();
    }
  }

  $scope.play = function () {
    if (!isPlaying) {
      isPlaying = true;
      restartTimer();
    }
  };
  $scope.pause = function () {
    if (!$scope.noPause) {
      isPlaying = false;
      resetTimer();
    }
  };

  self.addSlide = function (slide, element) {
    slide.$element = element;
    slides.push(slide);
    //if this is the first slide or the slide is set to active, select it
    if(slides.length === 1 || slide.active) {
      self.select(slides[slides.length-1]);
      if (slides.length == 1) {
        $scope.play();
      }
    } else {
      slide.active = false;
    }
  };

  self.removeSlide = function (slide) {
    //get the index of the slide inside the carousel
    var index = slides.indexOf(slide);
    slides.splice(index, 1);
    if (slides.length > 0 && slide.active) {
      if (index >= slides.length) {
        self.select(slides[index-1]);
      } else {
        self.select(slides[index]);
      }
    } else if (currentIndex > index) {
      currentIndex--;
    }
  };

}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:carousel
 * @restrict EA
 *
 * @description
 * Carousel is the outer container for a set of image 'slides' to showcase.
 *
 * @param {number=} interval The time, in milliseconds, that it will take the carousel to go to the next slide.
 * @param {boolean=} noTransition Whether to disable transitions on the carousel.
 * @param {boolean=} noPause Whether to disable pausing on the carousel (by default, the carousel interval pauses on hover).
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <carousel>
      <slide>
        <img src="http://placekitten.com/150/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>Beautiful!</p>
        </div>
      </slide>
      <slide>
        <img src="http://placekitten.com/100/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>D'aww!</p>
        </div>
      </slide>
    </carousel>
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
 */
.directive('carousel', [function () {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    controller: 'CarouselController',
    require: 'carousel',
    templateUrl: 'template/carousel/carousel.html',
    scope: {
      interval: '=',
      noTransition: '=',
      noPause: '='
    }
  };
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:slide
 * @restrict EA
 *
 * @description
 * Creates a slide inside a {@link ui.bootstrap.carousel.directive:carousel carousel}.  Must be placed as a child of a carousel element.
 *
 * @param {boolean=} active Model binding, whether or not this slide is currently active.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
<div ng-controller="CarouselDemoCtrl">
  <carousel>
    <slide ng-repeat="slide in slides" active="slide.active">
      <img ng-src="{{slide.image}}" style="margin:auto;">
      <div class="carousel-caption">
        <h4>Slide {{$index}}</h4>
        <p>{{slide.text}}</p>
      </div>
    </slide>
  </carousel>
  Interval, in milliseconds: <input type="number" ng-model="myInterval">
  <br />Enter a negative number to stop the interval.
</div>
  </file>
  <file name="script.js">
function CarouselDemoCtrl($scope) {
  $scope.myInterval = 5000;
}
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
*/

.directive('slide', function () {
  return {
    require: '^carousel',
    restrict: 'EA',
    transclude: true,
    replace: true,
    templateUrl: 'template/carousel/slide.html',
    scope: {
      active: '=?'
    },
    link: function (scope, element, attrs, carouselCtrl) {
      carouselCtrl.addSlide(scope, element);
      //when the scope is destroyed then remove the slide from the current slides array
      scope.$on('$destroy', function () {
        carouselCtrl.removeSlide(scope);
      });

      scope.$watch('active', function (active) {
        if (active) {
          carouselCtrl.select(scope);
        }
      });
    }
  };
});

angular.module('ui.bootstrap.dateparser', [])

.service('dateParser', ['$locale', 'orderByFilter', function ($locale, orderByFilter) {

  this.parsers = {};

  var formatCodeToRegex = {
    'yyyy': {
      regex: '\\d{4}',
      apply: function (value) { this.year = +value; }
    },
    'yy': {
      regex: '\\d{2}',
      apply: function (value) { this.year = +value + 2000; }
    },
    'y': {
      regex: '\\d{1,4}',
      apply: function (value) { this.year = +value; }
    },
    'MMMM': {
      regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
      apply: function (value) { this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value); }
    },
    'MMM': {
      regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
      apply: function (value) { this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value); }
    },
    'MM': {
      regex: '0[1-9]|1[0-2]',
      apply: function (value) { this.month = value - 1; }
    },
    'M': {
      regex: '[1-9]|1[0-2]',
      apply: function (value) { this.month = value - 1; }
    },
    'dd': {
      regex: '[0-2][0-9]{1}|3[0-1]{1}',
      apply: function (value) { this.date = +value; }
    },
    'd': {
      regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
      apply: function (value) { this.date = +value; }
    },
    'EEEE': {
      regex: $locale.DATETIME_FORMATS.DAY.join('|')
    },
    'EEE': {
      regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
    }
  };

  function createParser(format) {
    var map = [], regex = format.split('');

    angular.forEach(formatCodeToRegex, function (data, code) {
      var index = format.indexOf(code);

      if (index > -1) {
        format = format.split('');

        regex[index] = '(' + data.regex + ')';
        format[index] = '$'; // Custom symbol to define consumed part of format
        for (var i = index + 1, n = index + code.length; i < n; i++) {
          regex[i] = '';
          format[i] = '$';
        }
        format = format.join('');

        map.push({ index: index, apply: data.apply });
      }
    });

    return {
      regex: new RegExp('^' + regex.join('') + '$'),
      map: orderByFilter(map, 'index')
    };
  }

  this.parse = function (input, format) {
    if ( !angular.isString(input) || !format ) {
      return input;
    }

    format = $locale.DATETIME_FORMATS[format] || format;

    if ( !this.parsers[format] ) {
      this.parsers[format] = createParser(format);
    }

    var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex);

    if ( results && results.length ) {
      var fields = { year: 1900, month: 0, date: 1, hours: 0 }, dt;

      for( var i = 1, n = results.length; i < n; i++ ) {
        var mapper = map[i-1];
        if ( mapper.apply ) {
          mapper.apply.call(fields, results[i]);
        }
      }

      if ( isValid(fields.year, fields.month, fields.date) ) {
        dt = new Date( fields.year, fields.month, fields.date, fields.hours);
      }

      return dt;
    }
  };

  // Check if date is valid for specific month (and year for February).
  // Month: 0 = Jan, 1 = Feb, etc
  function isValid(year, month, date) {
    if ( month === 1 && date > 28) {
        return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
    }

    if ( month === 3 || month === 5 || month === 8 || month === 10) {
        return date < 31;
    }

    return true;
  }
}]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;
      }
    };
  }]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])

.constant('datepickerConfig', {
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  datepickerMode: 'day',
  minMode: 'day',
  maxMode: 'year',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
})

.controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig', function ($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
  var self = this,
      ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl;

  // Modes chain
  this.modes = ['day', 'month', 'year'];

  // Configuration attributes
  angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
                   'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange'], function ( key, index ) {
    self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
  });

  // Watchable date attributes
  angular.forEach(['minDate', 'maxDate'], function ( key ) {
    if ( $attrs[key] ) {
      $scope.$parent.$watch($parse($attrs[key]), function (value) {
        self[key] = value ? new Date(value) : null;
        self.refreshView();
      });
    } else {
      self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
    }
  });

  $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
  $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
  this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();

  $scope.isActive = function (dateObject) {
    if (self.compare(dateObject.date, self.activeDate) === 0) {
      $scope.activeDateId = dateObject.uid;
      return true;
    }
    return false;
  };

  this.init = function ( ngModelCtrl_ ) {
    ngModelCtrl = ngModelCtrl_;

    ngModelCtrl.$render = function () {
      self.render();
    };
  };

  this.render = function () {
    if ( ngModelCtrl.$modelValue ) {
      var date = new Date( ngModelCtrl.$modelValue ),
          isValid = !isNaN(date);

      if ( isValid ) {
        this.activeDate = date;
      } else {
        $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
      }
      ngModelCtrl.$setValidity('date', isValid);
    }
    this.refreshView();
  };

  this.refreshView = function () {
    if ( this.element ) {
      this._refreshView();

      var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
      ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
    }
  };

  this.createDateObject = function (date, format) {
    var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
    return {
      date: date,
      label: dateFilter(date, format),
      selected: model && this.compare(date, model) === 0,
      disabled: this.isDisabled(date),
      current: this.compare(date, new Date()) === 0
    };
  };

  this.isDisabled = function ( date ) {
    return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode})));
  };

  // Split array into smaller arrays
  this.split = function (arr, size) {
    var arrays = [];
    while (arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  };

  $scope.select = function ( date ) {
    if ( $scope.datepickerMode === self.minMode ) {
      var dt = ngModelCtrl.$modelValue ? new Date( ngModelCtrl.$modelValue ) : new Date(0, 0, 0, 0, 0, 0, 0);
      dt.setFullYear( date.getFullYear(), date.getMonth(), date.getDate() );
      ngModelCtrl.$setViewValue( dt );
      ngModelCtrl.$render();
    } else {
      self.activeDate = date;
      $scope.datepickerMode = self.modes[ self.modes.indexOf( $scope.datepickerMode ) - 1 ];
    }
  };

  $scope.move = function ( direction ) {
    var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
    self.activeDate.setFullYear(year, month, 1);
    self.refreshView();
  };

  $scope.toggleMode = function ( direction ) {
    direction = direction || 1;

    if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
      return;
    }

    $scope.datepickerMode = self.modes[ self.modes.indexOf( $scope.datepickerMode ) + direction ];
  };

  // Key event mapper
  $scope.keys = { 13:'enter', 32:'space', 33:'pageup', 34:'pagedown', 35:'end', 36:'home', 37:'left', 38:'up', 39:'right', 40:'down' };

  var focusElement = function () {
    $timeout(function () {
      self.element[0].focus();
    }, 0 , false);
  };

  // Listen for focus requests from popup directive
  $scope.$on('datepicker.focus', focusElement);

  $scope.keydown = function ( evt ) {
    var key = $scope.keys[evt.which];

    if ( !key || evt.shiftKey || evt.altKey ) {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    if (key === 'enter' || key === 'space') {
      if ( self.isDisabled(self.activeDate)) {
        return; // do nothing
      }
      $scope.select(self.activeDate);
      focusElement();
    } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
      $scope.toggleMode(key === 'up' ? 1 : -1);
      focusElement();
    } else {
      self.handleKeyDown(key, evt);
      self.refreshView();
    }
  };
}])

.directive( 'datepicker', function () {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/datepicker.html',
    scope: {
      datepickerMode: '=?',
      dateDisabled: '&'
    },
    require: ['datepicker', '?^ngModel'],
    controller: 'DatepickerController',
    link: function (scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if ( ngModelCtrl ) {
        datepickerCtrl.init( ngModelCtrl );
      }
    }
  };
})

.directive('daypicker', ['dateFilter', function (dateFilter) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/day.html',
    require: '^datepicker',
    link: function (scope, element, attrs, ctrl) {
      scope.showWeeks = ctrl.showWeeks;

      ctrl.step = { months: 1 };
      ctrl.element = element;

      var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function getDaysInMonth( year, month ) {
        return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
      }

      function getDates(startDate, n) {
        var dates = new Array(n), current = new Date(startDate), i = 0;
        current.setHours(12); // Prevent repeated dates because of timezone bug
        while ( i < n ) {
          dates[i++] = new Date(current);
          current.setDate( current.getDate() + 1 );
        }
        return dates;
      }

      ctrl._refreshView = function () {
        var year = ctrl.activeDate.getFullYear(),
          month = ctrl.activeDate.getMonth(),
          firstDayOfMonth = new Date(year, month, 1),
          difference = ctrl.startingDay - firstDayOfMonth.getDay(),
          numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : - difference,
          firstDate = new Date(firstDayOfMonth);

        if ( numDisplayedFromPreviousMonth > 0 ) {
          firstDate.setDate( - numDisplayedFromPreviousMonth + 1 );
        }

        // 42 is the number of days on a six-month calendar
        var days = getDates(firstDate, 42);
        for (var i = 0; i < 42; i ++) {
          days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
            secondary: days[i].getMonth() !== month,
            uid: scope.uniqueId + '-' + i
          });
        }

        scope.labels = new Array(7);
        for (var j = 0; j < 7; j++) {
          scope.labels[j] = {
            abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
            full: dateFilter(days[j].date, 'EEEE')
          };
        }

        scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
        scope.rows = ctrl.split(days, 7);

        if ( scope.showWeeks ) {
          scope.weekNumbers = [];
          var weekNumber = getISO8601WeekNumber( scope.rows[0][0].date ),
              numWeeks = scope.rows.length;
          while( scope.weekNumbers.push(weekNumber++) < numWeeks ) {}
        }
      };

      ctrl.compare = function (date1, date2) {
        return (new Date( date1.getFullYear(), date1.getMonth(), date1.getDate() ) - new Date( date2.getFullYear(), date2.getMonth(), date2.getDate() ) );
      };

      function getISO8601WeekNumber(date) {
        var checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
        var time = checkDate.getTime();
        checkDate.setMonth(0); // Compare with Jan 1
        checkDate.setDate(1);
        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
      }

      ctrl.handleKeyDown = function ( key, evt ) {
        var date = ctrl.activeDate.getDate();

        if (key === 'left') {
          date = date - 1;   // up
        } else if (key === 'up') {
          date = date - 7;   // down
        } else if (key === 'right') {
          date = date + 1;   // down
        } else if (key === 'down') {
          date = date + 7;
        } else if (key === 'pageup' || key === 'pagedown') {
          var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? - 1 : 1);
          ctrl.activeDate.setMonth(month, 1);
          date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
        } else if (key === 'home') {
          date = 1;
        } else if (key === 'end') {
          date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
        }
        ctrl.activeDate.setDate(date);
      };

      ctrl.refreshView();
    }
  };
}])

.directive('monthpicker', ['dateFilter', function (dateFilter) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/month.html',
    require: '^datepicker',
    link: function (scope, element, attrs, ctrl) {
      ctrl.step = { years: 1 };
      ctrl.element = element;

      ctrl._refreshView = function () {
        var months = new Array(12),
            year = ctrl.activeDate.getFullYear();

        for ( var i = 0; i < 12; i++ ) {
          months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
            uid: scope.uniqueId + '-' + i
          });
        }

        scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
        scope.rows = ctrl.split(months, 3);
      };

      ctrl.compare = function (date1, date2) {
        return new Date( date1.getFullYear(), date1.getMonth() ) - new Date( date2.getFullYear(), date2.getMonth() );
      };

      ctrl.handleKeyDown = function ( key, evt ) {
        var date = ctrl.activeDate.getMonth();

        if (key === 'left') {
          date = date - 1;   // up
        } else if (key === 'up') {
          date = date - 3;   // down
        } else if (key === 'right') {
          date = date + 1;   // down
        } else if (key === 'down') {
          date = date + 3;
        } else if (key === 'pageup' || key === 'pagedown') {
          var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? - 1 : 1);
          ctrl.activeDate.setFullYear(year);
        } else if (key === 'home') {
          date = 0;
        } else if (key === 'end') {
          date = 11;
        }
        ctrl.activeDate.setMonth(date);
      };

      ctrl.refreshView();
    }
  };
}])

.directive('yearpicker', ['dateFilter', function (dateFilter) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/year.html',
    require: '^datepicker',
    link: function (scope, element, attrs, ctrl) {
      var range = ctrl.yearRange;

      ctrl.step = { years: range };
      ctrl.element = element;

      function getStartingYear( year ) {
        return parseInt((year - 1) / range, 10) * range + 1;
      }

      ctrl._refreshView = function () {
        var years = new Array(range);

        for ( var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++ ) {
          years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
            uid: scope.uniqueId + '-' + i
          });
        }

        scope.title = [years[0].label, years[range - 1].label].join(' - ');
        scope.rows = ctrl.split(years, 5);
      };

      ctrl.compare = function (date1, date2) {
        return date1.getFullYear() - date2.getFullYear();
      };

      ctrl.handleKeyDown = function ( key, evt ) {
        var date = ctrl.activeDate.getFullYear();

        if (key === 'left') {
          date = date - 1;   // up
        } else if (key === 'up') {
          date = date - 5;   // down
        } else if (key === 'right') {
          date = date + 1;   // down
        } else if (key === 'down') {
          date = date + 5;
        } else if (key === 'pageup' || key === 'pagedown') {
          date += (key === 'pageup' ? - 1 : 1) * ctrl.step.years;
        } else if (key === 'home') {
          date = getStartingYear( ctrl.activeDate.getFullYear() );
        } else if (key === 'end') {
          date = getStartingYear( ctrl.activeDate.getFullYear() ) + range - 1;
        }
        ctrl.activeDate.setFullYear(date);
      };

      ctrl.refreshView();
    }
  };
}])

.constant('datepickerPopupConfig', {
  datepickerPopup: 'yyyy-MM-dd',
  currentText: 'Today',
  clearText: 'Clear',
  closeText: 'Done',
  closeOnDateSelection: true,
  appendToBody: false,
  showButtonBar: true
})

.directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
function ($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
  return {
    restrict: 'EA',
    require: 'ngModel',
    scope: {
      isOpen: '=?',
      currentText: '@',
      clearText: '@',
      closeText: '@',
      dateDisabled: '&'
    },
    link: function (scope, element, attrs, ngModel) {
      var dateFormat,
          closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
          appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

      scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

      scope.getText = function ( key ) {
        return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
      };

      attrs.$observe('datepickerPopup', function (value) {
          dateFormat = value || datepickerPopupConfig.datepickerPopup;
          ngModel.$render();
      });

      // popup element used to display calendar
      var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
      popupEl.attr({
        'ng-model': 'date',
        'ng-change': 'dateSelection()'
      });

      function cameltoDash( string ){
        return string.replace(/([A-Z])/g, function ($1) { return '-' + $1.toLowerCase(); });
      }

      // datepicker element
      var datepickerEl = angular.element(popupEl.children()[0]);
      if ( attrs.datepickerOptions ) {
        angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function ( value, option ) {
          datepickerEl.attr( cameltoDash(option), value );
        });
      }

      scope.watchData = {};
      angular.forEach(['minDate', 'maxDate', 'datepickerMode'], function ( key ) {
        if ( attrs[key] ) {
          var getAttribute = $parse(attrs[key]);
          scope.$parent.$watch(getAttribute, function (value){
            scope.watchData[key] = value;
          });
          datepickerEl.attr(cameltoDash(key), 'watchData.' + key);

          // Propagate changes from datepicker to outside
          if ( key === 'datepickerMode' ) {
            var setAttribute = getAttribute.assign;
            scope.$watch('watchData.' + key, function (value, oldvalue) {
              if ( value !== oldvalue ) {
                setAttribute(scope.$parent, value);
              }
            });
          }
        }
      });
      if (attrs.dateDisabled) {
        datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
      }

      function parseDate(viewValue) {
        if (!viewValue) {
          ngModel.$setValidity('date', true);
          return null;
        } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
          ngModel.$setValidity('date', true);
          return viewValue;
        } else if (angular.isString(viewValue)) {
          var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
          if (isNaN(date)) {
            ngModel.$setValidity('date', false);
            return undefined;
          } else {
            ngModel.$setValidity('date', true);
            return date;
          }
        } else {
          ngModel.$setValidity('date', false);
          return undefined;
        }
      }
      ngModel.$parsers.unshift(parseDate);

      // Inner change
      scope.dateSelection = function (dt) {
        if (angular.isDefined(dt)) {
          scope.date = dt;
        }
        ngModel.$setViewValue(scope.date);
        ngModel.$render();

        if ( closeOnDateSelection ) {
          scope.isOpen = false;
          element[0].focus();
        }
      };

      element.bind('input change keyup', function () {
        scope.$apply(function () {
          scope.date = ngModel.$modelValue;
        });
      });

      // Outter change
      ngModel.$render = function () {
        var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
        element.val(date);
        scope.date = parseDate( ngModel.$modelValue );
      };

      var documentClickBind = function (event) {
        if (scope.isOpen && event.target !== element[0]) {
          scope.$apply(function () {
            scope.isOpen = false;
          });
        }
      };

      var keydown = function (evt, noApply) {
        scope.keydown(evt);
      };
      element.bind('keydown', keydown);

      scope.keydown = function (evt) {
        if (evt.which === 27) {
          evt.preventDefault();
          evt.stopPropagation();
          scope.close();
        } else if (evt.which === 40 && !scope.isOpen) {
          scope.isOpen = true;
        }
      };

      scope.$watch('isOpen', function (value) {
        if (value) {
          scope.$broadcast('datepicker.focus');
          scope.position = appendToBody ? $position.offset(element) : $position.position(element);
          scope.position.top = scope.position.top + element.prop('offsetHeight');

          $document.bind('click', documentClickBind);
        } else {
          $document.unbind('click', documentClickBind);
        }
      });

      scope.select = function ( date ) {
        if (date === 'today') {
          var today = new Date();
          if (angular.isDate(ngModel.$modelValue)) {
            date = new Date(ngModel.$modelValue);
            date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
          } else {
            date = new Date(today.setHours(0, 0, 0, 0));
          }
        }
        scope.dateSelection( date );
      };

      scope.close = function () {
        scope.isOpen = false;
        element[0].focus();
      };

      var $popup = $compile(popupEl)(scope);
      if ( appendToBody ) {
        $document.find('body').append($popup);
      } else {
        element.after($popup);
      }

      scope.$on('$destroy', function () {
        $popup.remove();
        element.unbind('keydown', keydown);
        $document.unbind('click', documentClickBind);
      });
    }
  };
}])

.directive('datepickerPopupWrap', function () {
  return {
    restrict:'EA',
    replace: true,
    transclude: true,
    templateUrl: 'template/datepicker/popup.html',
    link:function (scope, element, attrs) {
      element.bind('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});

angular.module('ui.bootstrap.dropdown', [])

.constant('dropdownConfig', {
  openClass: 'open'
})

.service('dropdownService', ['$document', function ($document) {
  var openScope = null;

  this.open = function ( dropdownScope ) {
    if ( !openScope ) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', escapeKeyBind);
    }

    if ( openScope && openScope !== dropdownScope ) {
        openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function ( dropdownScope ) {
    if ( openScope === dropdownScope ) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', escapeKeyBind);
    }
  };

  var closeDropdown = function ( evt ) {
    var toggleElement = openScope.getToggleElement();
    if ( evt && toggleElement && toggleElement[0].contains(evt.target) ) {
        return;
    }

    openScope.$apply(function () {
      openScope.isOpen = false;
    });
  };

  var escapeKeyBind = function ( evt ) {
    if ( evt.which === 27 ) {
      openScope.focusToggleElement();
      closeDropdown();
    }
  };
}])

.controller('DropdownController', ['$scope', '$attrs', '$parse', 'dropdownConfig', 'dropdownService', '$animate', function ($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate) {
  var self = this,
      scope = $scope.$new(), // create a child scope so we are not polluting original one
      openClass = dropdownConfig.openClass,
      getIsOpen,
      setIsOpen = angular.noop,
      toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

  this.init = function ( element ) {
    self.$element = element;

    if ( $attrs.isOpen ) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function (value) {
        scope.isOpen = !!value;
      });
    }
  };

  this.toggle = function ( open ) {
    return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function () {
    return scope.isOpen;
  };

  scope.getToggleElement = function () {
    return self.toggleElement;
  };

  scope.focusToggleElement = function () {
    if ( self.toggleElement ) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function ( isOpen, wasOpen ) {
    $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

    if ( isOpen ) {
      scope.focusToggleElement();
      dropdownService.open( scope );
    } else {
      dropdownService.close( scope );
    }

    setIsOpen($scope, isOpen);
    if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
      toggleInvoker($scope, { open: !!isOpen });
    }
  });

  $scope.$on('$locationChangeSuccess', function () {
    scope.isOpen = false;
  });

  $scope.$on('$destroy', function () {
    scope.$destroy();
  });
}])

.directive('dropdown', function () {
  return {
    restrict: 'CA',
    controller: 'DropdownController',
    link: function (scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init( element );
    }
  };
})

.directive('dropdownToggle', function () {
  return {
    restrict: 'CA',
    require: '?^dropdown',
    link: function (scope, element, attrs, dropdownCtrl) {
      if ( !dropdownCtrl ) {
        return;
      }

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function (event) {
        event.preventDefault();

        if ( !element.hasClass('disabled') && !attrs.disabled ) {
          scope.$apply(function () {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function ( isOpen ) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function () {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});

angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function () {
    return {
      createNew: function () {
        var stack = [];

        return {
          add: function (key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function (key) {
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function () {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function () {
            return stack[stack.length - 1];
          },
          remove: function (key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function () {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function () {
            return stack.length;
          }
        };
      }
    };
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('modalBackdrop', ['$timeout', function ($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/modal/backdrop.html',
      link: function (scope, element, attrs) {
        scope.backdropClass = attrs.backdropClass || '';

        scope.animate = false;

        //trigger CSS transitions
        $timeout(function () {
          scope.animate = true;
        });
      }
    };
  }])

  .directive('modalWindow', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        index: '@',
        animate: '='
      },
      replace: true,
      transclude: true,
      templateUrl: function (tElement, tAttrs) {
        return tAttrs.templateUrl || 'template/modal/window.html';
      },
      link: function (scope, element, attrs) {
        element.addClass(attrs.windowClass || '');
        scope.size = attrs.size;

        $timeout(function () {
          // trigger CSS transitions
          scope.animate = true;

          /**
           * Auto-focusing of a freshly-opened modal element causes any child elements
           * with the autofocus attribute to loose focus. This is an issue on touch
           * based devices which will show and then hide the onscreen keyboard.
           * Attempts to refocus the autofocus element via JavaScript will not reopen
           * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
           * the modal element if the modal does not contain an autofocus element.
           */
          if (!element[0].querySelectorAll('[autofocus]').length) {
            element[0].focus();
          }
        });

        scope.close = function (evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };
      }
    };
  }])

  .directive('modalTransclude', function () {
    return {
      link: function ($scope, $element, $attrs, controller, $transclude) {
        $transclude($scope.$parent, function (clone) {
          $element.empty();
          $element.append(clone);
        });
      }
    };
  })

  .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var $modalStack = {};

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function (newBackdropIndex){
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance) {

        var body = $document.find('body').eq(0);
        var modalWindow = openedWindows.get(modalInstance).value;

        //clean up the stack
        openedWindows.remove(modalInstance);

        //remove window DOM element
        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function () {
          modalWindow.modalScope.$destroy();
          body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
          checkRemoveBackdrop();
        });
      }

      function checkRemoveBackdrop() {
          //remove backdrop if no longer needed
          if (backdropDomEl && backdropIndex() == -1) {
            var backdropScopeRef = backdropScope;
            removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
              backdropScopeRef.$destroy();
              backdropScopeRef = null;
            });
            backdropDomEl = undefined;
            backdropScope = undefined;
          }
      }

      function removeAfterAnimate(domEl, scope, emulateTime, done) {
        // Closing animation
        scope.animate = false;

        var transitionEndEventName = $transition.transitionEndEventName;
        if (transitionEndEventName) {
          // transition out
          var timeout = $timeout(afterAnimating, emulateTime);

          domEl.bind(transitionEndEventName, function () {
            $timeout.cancel(timeout);
            afterAnimating();
            scope.$apply();
          });
        } else {
          // Ensure this call is async
          $timeout(afterAnimating);
        }

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          domEl.remove();
          if (done) {
            done();
          }
        }
      }

      $document.bind('keydown', function (evt) {
        var modal;

        if (evt.which === 27) {
          modal = openedWindows.top();
          if (modal && modal.value.keyboard) {
            evt.preventDefault();
            $rootScope.$apply(function () {
              $modalStack.dismiss(modal.key, 'escape key press');
            });
          }
        }
      });

      $modalStack.open = function (modalInstance, modal) {

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard
        });

        var body = $document.find('body').eq(0),
            currBackdropIndex = backdropIndex();

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.index = currBackdropIndex;
          var angularBackgroundDomEl = angular.element('<div modal-backdrop></div>');
          angularBackgroundDomEl.attr('backdrop-class', modal.backdropClass);
          backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
          body.append(backdropDomEl);
        }

        var angularDomEl = angular.element('<div modal-window></div>');
        angularDomEl.attr({
          'template-url': modal.windowTemplateUrl,
          'window-class': modal.windowClass,
          'size': modal.size,
          'index': openedWindows.length() - 1,
          'animate': 'animate'
        }).html(modal.content);

        var modalDomEl = $compile(angularDomEl)(modal.scope);
        openedWindows.top().value.modalDomEl = modalDomEl;
        body.append(modalDomEl);
        body.addClass(OPENED_MODAL_CLASS);
      };

      $modalStack.close = function (modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismiss = function (modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismissAll = function (reason) {
        var topModal = this.getTop();
        while (topModal) {
          this.dismiss(topModal.key, reason);
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function () {
        return openedWindows.top();
      };

      return $modalStack;
    }])

  .provider('$modal', function () {

    var $modalProvider = {
      options: {
        backdrop: true, //can be also false or 'static'
        keyboard: true
      },
      $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
        function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $http.get(angular.isFunction (options.templateUrl) ? (options.templateUrl)() : options.templateUrl,
                {cache: $templateCache}).then(function (result) {
                  return result.data;
              });
          }

          function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function (value) {
              if (angular.isFunction (value) || angular.isArray(value)) {
                promisesArr.push($q.when($injector.invoke(value)));
              }
            });
            return promisesArr;
          }

          $modal.open = function (modalOptions) {

            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              close: function (result) {
                $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};

            //verify options
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }

            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

              var modalScope = (modalOptions.scope || $rootScope).$new();
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;

              var ctrlInstance, ctrlLocals = {};
              var resolveIter = 1;

              //controllers
              if (modalOptions.controller) {
                ctrlLocals.$scope = modalScope;
                ctrlLocals.$modalInstance = modalInstance;
                angular.forEach(modalOptions.resolve, function (value, key) {
                  ctrlLocals[key] = tplAndVars[resolveIter++];
                });

                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                if (modalOptions.controller) {
                  modalScope[modalOptions.controllerAs] = ctrlInstance;
                }
              }

              $modalStack.open(modalInstance, {
                scope: modalScope,
                deferred: modalResultDeferred,
                content: tplAndVars[0],
                backdrop: modalOptions.backdrop,
                keyboard: modalOptions.keyboard,
                backdropClass: modalOptions.backdropClass,
                windowClass: modalOptions.windowClass,
                windowTemplateUrl: modalOptions.windowTemplateUrl,
                size: modalOptions.size
              });

            }, function resolveError(reason) {
              modalResultDeferred.reject(reason);
            });

            templateAndResolvePromise.then(function () {
              modalOpenedDeferred.resolve(true);
            }, function () {
              modalOpenedDeferred.reject(false);
            });

            return modalInstance;
          };

          return $modal;
        }]
    };

    return $modalProvider;
  });

angular.module('ui.bootstrap.pagination', [])

.controller('PaginationController', ['$scope', '$attrs', '$parse', function ($scope, $attrs, $parse) {
  var self = this,
      ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
      setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;

  this.init = function (ngModelCtrl_, config) {
    ngModelCtrl = ngModelCtrl_;
    this.config = config;

    ngModelCtrl.$render = function () {
      self.render();
    };

    if ($attrs.itemsPerPage) {
      $scope.$parent.$watch($parse($attrs.itemsPerPage), function (value) {
        self.itemsPerPage = parseInt(value, 10);
        $scope.totalPages = self.calculateTotalPages();
      });
    } else {
      this.itemsPerPage = config.itemsPerPage;
    }
  };

  this.calculateTotalPages = function () {
    var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
    return Math.max(totalPages || 0, 1);
  };

  this.render = function () {
    $scope.page = parseInt(ngModelCtrl.$viewValue, 10) || 1;
  };

  $scope.selectPage = function (page) {
    if ( $scope.page !== page && page > 0 && page <= $scope.totalPages) {
      ngModelCtrl.$setViewValue(page);
      ngModelCtrl.$render();
    }
  };

  $scope.getText = function ( key ) {
    return $scope[key + 'Text'] || self.config[key + 'Text'];
  };
  $scope.noPrevious = function () {
    return $scope.page === 1;
  };
  $scope.noNext = function () {
    return $scope.page === $scope.totalPages;
  };

  $scope.$watch('totalItems', function () {
    $scope.totalPages = self.calculateTotalPages();
  });

  $scope.$watch('totalPages', function (value) {
    setNumPages($scope.$parent, value); // Readonly variable

    if ( $scope.page > value ) {
      $scope.selectPage(value);
    } else {
      ngModelCtrl.$render();
    }
  });
}])

.constant('paginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true
})

.directive('pagination', ['$parse', 'paginationConfig', function ($parse, paginationConfig) {
  return {
    restrict: 'EA',
    scope: {
      totalItems: '=',
      firstText: '@',
      previousText: '@',
      nextText: '@',
      lastText: '@'
    },
    require: ['pagination', '?ngModel'],
    controller: 'PaginationController',
    templateUrl: 'template/pagination/pagination.html',
    replace: true,
    link: function (scope, element, attrs, ctrls) {
      var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (!ngModelCtrl) {
         return; // do nothing if no ng-model
      }

      // Setup configuration parameters
      var maxSize = angular.isDefined(attrs.maxSize) ? scope.$parent.$eval(attrs.maxSize) : paginationConfig.maxSize,
          rotate = angular.isDefined(attrs.rotate) ? scope.$parent.$eval(attrs.rotate) : paginationConfig.rotate;
      scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
      scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : paginationConfig.directionLinks;

      paginationCtrl.init(ngModelCtrl, paginationConfig);

      if (attrs.maxSize) {
        scope.$parent.$watch($parse(attrs.maxSize), function (value) {
          maxSize = parseInt(value, 10);
          paginationCtrl.render();
        });
      }

      // Create page object used in template
      function makePage(number, text, isActive) {
        return {
          number: number,
          text: text,
          active: isActive
        };
      }

      function getPages(currentPage, totalPages) {
        var pages = [];

        // Default page limits
        var startPage = 1, endPage = totalPages;
        var isMaxSized = ( angular.isDefined(maxSize) && maxSize < totalPages );

        // recompute if maxSize
        if ( isMaxSized ) {
          if ( rotate ) {
            // Current page is displayed in the middle of the visible ones
            startPage = Math.max(currentPage - Math.floor(maxSize/2), 1);
            endPage   = startPage + maxSize - 1;

            // Adjust if limit is exceeded
            if (endPage > totalPages) {
              endPage   = totalPages;
              startPage = endPage - maxSize + 1;
            }
          } else {
            // Visible pages are paginated with maxSize
            startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;

            // Adjust last page if limit is exceeded
            endPage = Math.min(startPage + maxSize - 1, totalPages);
          }
        }

        // Add page number links
        for (var number = startPage; number <= endPage; number++) {
          var page = makePage(number, number, number === currentPage);
          pages.push(page);
        }

        // Add links to move between page sets
        if ( isMaxSized && ! rotate ) {
          if ( startPage > 1 ) {
            var previousPageSet = makePage(startPage - 1, '...', false);
            pages.unshift(previousPageSet);
          }

          if ( endPage < totalPages ) {
            var nextPageSet = makePage(endPage + 1, '...', false);
            pages.push(nextPageSet);
          }
        }

        return pages;
      }

      var originalRender = paginationCtrl.render;
      paginationCtrl.render = function () {
        originalRender();
        if (scope.page > 0 && scope.page <= scope.totalPages) {
          scope.pages = getPages(scope.page, scope.totalPages);
        }
      };
    }
  };
}])

.constant('pagerConfig', {
  itemsPerPage: 10,
  previousText: '« Previous',
  nextText: 'Next »',
  align: true
})

.directive('pager', ['pagerConfig', function (pagerConfig) {
  return {
    restrict: 'EA',
    scope: {
      totalItems: '=',
      previousText: '@',
      nextText: '@'
    },
    require: ['pager', '?ngModel'],
    controller: 'PaginationController',
    templateUrl: 'template/pagination/pager.html',
    replace: true,
    link: function (scope, element, attrs, ctrls) {
      var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (!ngModelCtrl) {
         return; // do nothing if no ng-model
      }

      scope.align = angular.isDefined(attrs.align) ? scope.$parent.$eval(attrs.align) : pagerConfig.align;
      paginationCtrl.init(ngModelCtrl, pagerConfig);
    }
  };
}]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module( 'ui.bootstrap.tooltip', [ 'ui.bootstrap.position', 'ui.bootstrap.bindHtml' ] )

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider( '$tooltip', function () {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    animation: true,
    popupDelay: 0
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur'
  };

  // The options specified to the provider globally.
  var globalOptions = {};

  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function ( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function ( value ) {
		angular.extend( globalOptions, value );
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
   */
  this.setTriggers = function setTriggers ( triggers ) {
    angular.extend( triggerMap, triggers );
  };

  /**
   * This is a helper function for translating camel-case to snake-case.
   */
  function snake_case(name){
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = [ '$window', '$compile', '$timeout', '$parse', '$document', '$position', '$interpolate', '$http', '$templateCache', function ( $window, $compile, $timeout, $parse, $document, $position, $interpolate, $http, $templateCache ) {
    return function $tooltip ( type, prefix, defaultTriggerShow ) {
      var options = angular.extend( {}, defaultOptions, globalOptions );

      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers ( trigger ) {
        var show = trigger || options.trigger || defaultTriggerShow;
        var hide = triggerMap[show] || show;
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case( type );

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template =
        '<div '+ directiveName +'-popup '+
          'title="'+startSym+'tt_title'+endSym+'" '+
          'content="'+startSym+'tt_content'+endSym+'" '+
          'placement="'+startSym+'tt_placement'+endSym+'" '+
          'animation="tt_animation" '+
          'is-open="tt_isOpen"'+
          'template="tt_template"'+
          '>'+
        '</div>';

      return {
        restrict: 'EA',
        scope: true,
        compile: function (tElem, tAttrs) {
          var tooltipLinker = $compile( template );

          return function link ( scope, element, attrs ) {
            var tooltip;
            var transitionTimeout;
            var popupTimeout;
            var appendToBody = angular.isDefined( options.appendToBody ) ? options.appendToBody : false;
            var triggers = getTriggers( undefined );
            var hasEnableExp = angular.isDefined(attrs[prefix+'Enable']);

            var positionTooltip = function () {

              var ttPosition = $position.positionElements(element, tooltip, scope.tt_placement, appendToBody);
              ttPosition.top += 'px';
              ttPosition.left += 'px';

              // Now set the calculated positioning.
              tooltip.css( ttPosition );
            };

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            scope.tt_isOpen = false;

            function toggleTooltipBind () {
              if ( ! scope.tt_isOpen ) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if(hasEnableExp && !scope.$eval(attrs[prefix+'Enable'])) {
                return;
              }
              if ( scope.tt_popupDelay ) {
                // Do nothing if the tooltip was already scheduled to pop-up.
                // This happens if show is triggered multiple times before any hide is triggered.
                if (!popupTimeout) {
                  popupTimeout = $timeout( show, scope.tt_popupDelay, false );
                  popupTimeout.then(function (reposition){reposition();});
                }
              } else {
                show()();
              }
            }

            function hideTooltipBind () {
              scope.$apply(function () {
                hide();
              });
            }

            // Show the tooltip popup element.
            function show() {

              popupTimeout = null;

              // If there is a pending remove transition, we must cancel it, lest the
              // tooltip be mysteriously removed.
              if ( transitionTimeout ) {
                $timeout.cancel( transitionTimeout );
                transitionTimeout = null;
              }

              // Don't show empty tooltips.
              if ( ! scope.tt_content ) {
                return angular.noop;
              }

              createTooltip();

              // Set the initial positioning.
              tooltip.css({ top: 0, left: 0, display: 'block' });

              // Now we add it to the DOM because need some info about it. But it's not
              // visible yet anyway.
              if ( appendToBody ) {
                  $document.find( 'body' ).append( tooltip );
              } else {
                element.after( tooltip );
              }

              positionTooltip();

              // And show the tooltip.
              scope.tt_isOpen = true;
              scope.$digest(); // digest required as $apply is not called

              // Return positioning function as promise callback for correct
              // positioning after draw.
              return positionTooltip;
            }

            // Hide the tooltip popup element.
            function hide() {
              // First things first: we don't show it anymore.
              scope.tt_isOpen = false;

              //if tooltip is going to be shown after delay, we must cancel this
              $timeout.cancel( popupTimeout );
              popupTimeout = null;

              // And now we remove it from the DOM. However, if we have animation, we
              // need to wait for it to expire beforehand.
              // FIXME: this is a placeholder for a port of the transitions library.
              if ( scope.tt_animation ) {
                if (!transitionTimeout) {
                  transitionTimeout = $timeout(removeTooltip, 500);
                }
              } else {
                removeTooltip();
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                removeTooltip();
              }
              tooltip = tooltipLinker(scope, function () {});

              // Get contents rendered into the tooltip
              scope.$digest();
            }

            function removeTooltip() {
              transitionTimeout = null;
              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }
            }

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe( type, function ( val ) {
              scope.tt_content = val;

              if (!val && scope.tt_isOpen ) {
                hide();
              }
            });

            attrs.$observe( prefix+'Title', function ( val ) {
              scope.tt_title = val;
            });

            attrs.$observe( prefix+'Placement', function ( val ) {
              scope.tt_placement = angular.isDefined( val ) ? val : options.placement;
            });

            attrs.$observe( prefix+'PopupDelay', function ( val ) {
              var delay = parseInt( val, 10 );
              scope.tt_popupDelay = ! isNaN(delay) ? delay : options.popupDelay;
            });

            attrs.$observe( 'popoverTemplate', function ( val ) {
              if ( !val ) { return; }
              $http.get( val, { cache: $templateCache } )
              .then( function ( response ) {
                scope.tt_template = $compile( response.data.trim() )( scope.$parent );
              });
            });

            var unregisterTriggers = function () {
              element.unbind(triggers.show, showTooltipBind);
              element.unbind(triggers.hide, hideTooltipBind);
            };

            attrs.$observe( prefix+'Trigger', function ( val ) {
              unregisterTriggers();

              triggers = getTriggers( val );

              if ( triggers.show === triggers.hide ) {
                element.bind( triggers.show, toggleTooltipBind );
              } else {
                element.bind( triggers.show, showTooltipBind );
                element.bind( triggers.hide, hideTooltipBind );
              }
            });

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation;

            attrs.$observe( prefix+'AppendToBody', function ( val ) {
              appendToBody = angular.isDefined( val ) ? $parse( val )( scope ) : appendToBody;
            });

            // if a tooltip is attached to <body> we need to remove it on
            // location change as its parent scope will probably not be destroyed
            // by the change.
            if ( appendToBody ) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess () {
              if ( scope.tt_isOpen ) {
                hide();
              }
            });
            }

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              $timeout.cancel( transitionTimeout );
              $timeout.cancel( popupTimeout );
              unregisterTriggers();
              removeTooltip();
            });
          };
        }
      };
    };
  }];
})

.directive( 'tooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
})

.directive( 'tooltip', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltip', 'tooltip', 'mouseenter' );
}])

.directive( 'tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
})

.directive( 'tooltipHtmlUnsafe', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltipHtmlUnsafe', 'tooltip', 'mouseenter' );
}]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */
angular.module( 'ui.bootstrap.popover', [ 'ui.bootstrap.tooltip' ] )

.directive( 'popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/popover/popover.html'
  };
})

.directive( 'popover', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'popover', 'popover', 'click' );
}])

.directive( 'popoverTemplatePopup', [ function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', template: '=', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/popover/popover-template.html',
    link: function ( scope, iElement ) {
      var contentEl = angular.element( iElement[0].querySelector( '.popover-content' ) );
      scope.$watch( 'template', function ( template ) {
        if ( !template ) { return; }
        contentEl.children().remove();
        contentEl.append( template );
      });
    }
  };
}])

.directive( 'popoverTemplate', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'popoverTemplate', 'popover', 'click' );
}]);

angular.module('ui.bootstrap.progressbar', [])

.constant('progressConfig', {
  animate: true,
  max: 100
})

.controller('ProgressController', ['$scope', '$attrs', 'progressConfig', function ($scope, $attrs, progressConfig) {
    var self = this,
        animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

    this.bars = [];
    $scope.max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max;

    this.addBar = function (bar, element) {
        if ( !animate ) {
            element.css({'transition': 'none'});
        }

        this.bars.push(bar);

        bar.$watch('value', function ( value ) {
            bar.percent = +(100 * value / $scope.max).toFixed(2);
        });

        bar.$on('$destroy', function () {
            element = null;
            self.removeBar(bar);
        });
    };

    this.removeBar = function (bar) {
        this.bars.splice(this.bars.indexOf(bar), 1);
    };
}])

.directive('progress', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        require: 'progress',
        scope: {},
        templateUrl: 'template/progressbar/progress.html'
    };
})

.directive('bar', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        require: '^progress',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: 'template/progressbar/bar.html',
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, element);
        }
    };
})

.directive('progressbar', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: 'template/progressbar/progressbar.html',
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, angular.element(element.children()[0]));
        }
    };
});
angular.module('ui.bootstrap.rating', [])

.constant('ratingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null
})

.controller('RatingController', ['$scope', '$attrs', 'ratingConfig', function ($scope, $attrs, ratingConfig) {
  var ngModelCtrl  = { $setViewValue: angular.noop };

  this.init = function (ngModelCtrl_) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;

    var ratingStates = angular.isDefined($attrs.ratingStates) ? $scope.$parent.$eval($attrs.ratingStates) :
                        new Array( angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max );
    $scope.range = this.buildTemplateObjects(ratingStates);
  };

  this.buildTemplateObjects = function (states) {
    for (var i = 0, n = states.length; i < n; i++) {
      states[i] = angular.extend({ index: i }, { stateOn: this.stateOn, stateOff: this.stateOff }, states[i]);
    }
    return states;
  };

  $scope.rate = function (value) {
    if ( !$scope.readonly && value >= 0 && value <= $scope.range.length ) {
      ngModelCtrl.$setViewValue(value);
      ngModelCtrl.$render();
    }
  };

  $scope.enter = function (value) {
    if ( !$scope.readonly ) {
      $scope.value = value;
    }
    $scope.onHover({value: value});
  };

  $scope.reset = function () {
    $scope.value = ngModelCtrl.$viewValue;
    $scope.onLeave();
  };

  $scope.onKeydown = function (evt) {
    if (/(37|38|39|40)/.test(evt.which)) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.rate( $scope.value + (evt.which === 38 || evt.which === 39 ? 1 : -1) );
    }
  };

  this.render = function () {
    $scope.value = ngModelCtrl.$viewValue;
  };
}])

.directive('rating', function () {
  return {
    restrict: 'EA',
    require: ['rating', 'ngModel'],
    scope: {
      readonly: '=?',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'RatingController',
    templateUrl: 'template/rating/rating.html',
    replace: true,
    link: function (scope, element, attrs, ctrls) {
      var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if ( ngModelCtrl ) {
        ratingCtrl.init( ngModelCtrl );
      }
    }
  };
});

/**
 * @ngdoc overview
 * @name ui.bootstrap.tabs
 *
 * @description
 * AngularJS version of the tabs directive.
 */

angular.module('ui.bootstrap.tabs', [])

.controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
  var ctrl = this,
      tabs = ctrl.tabs = $scope.tabs = [];

  ctrl.select = function (selectedTab) {
    angular.forEach(tabs, function (tab) {
      if (tab.active && tab !== selectedTab) {
        tab.active = false;
        tab.onDeselect();
      }
    });
    selectedTab.active = true;
    selectedTab.onSelect();
  };

  ctrl.addTab = function addTab(tab) {
    tabs.push(tab);
    // we can't run the select function on the first tab
    // since that would select it twice
    if (tabs.length === 1) {
      tab.active = true;
    } else if (tab.active) {
      ctrl.select(tab);
    }
  };

  ctrl.removeTab = function removeTab(tab) {
    var index = tabs.indexOf(tab);
    //Select a new tab if the tab to be removed is selected
    if (tab.active && tabs.length > 1) {
      //If this is the last tab, select the previous tab. else, the next tab.
      var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
      ctrl.select(tabs[newActiveIndex]);
    }
    tabs.splice(index, 1);
  };
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabset
 * @restrict EA
 *
 * @description
 * Tabset is the outer container for the tabs directive
 *
 * @param {boolean=} vertical Whether or not to use vertical styling for the tabs.
 * @param {boolean=} justified Whether or not to use justified styling for the tabs.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab heading="Tab 1"><b>First</b> Content!</tab>
      <tab heading="Tab 2"><i>Second</i> Content!</tab>
    </tabset>
    <hr />
    <tabset vertical="true">
      <tab heading="Vertical Tab 1"><b>First</b> Vertical Content!</tab>
      <tab heading="Vertical Tab 2"><i>Second</i> Vertical Content!</tab>
    </tabset>
    <tabset justified="true">
      <tab heading="Justified Tab 1"><b>First</b> Justified Content!</tab>
      <tab heading="Justified Tab 2"><i>Second</i> Justified Content!</tab>
    </tabset>
  </file>
</example>
 */
.directive('tabset', function () {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    scope: {
      type: '@'
    },
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    link: function (scope, element, attrs) {
      scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
      scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
    }
  };
})

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tab
 * @restrict EA
 *
 * @param {string=} heading The visible heading, or title, of the tab. Set HTML headings with {@link ui.bootstrap.tabs.directive:tabHeading tabHeading}.
 * @param {string=} select An expression to evaluate when the tab is selected.
 * @param {boolean=} active A binding, telling whether or not this tab is selected.
 * @param {boolean=} disabled A binding, telling whether or not this tab is disabled.
 *
 * @description
 * Creates a tab with a heading and content. Must be placed within a {@link ui.bootstrap.tabs.directive:tabset tabset}.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <div ng-controller="TabsDemoCtrl">
      <button class="btn btn-small" ng-click="items[0].active = true">
        Select item 1, using active binding
      </button>
      <button class="btn btn-small" ng-click="items[1].disabled = !items[1].disabled">
        Enable/disable item 2, using disabled binding
      </button>
      <br />
      <tabset>
        <tab heading="Tab 1">First Tab</tab>
        <tab select="alertMe()">
          <tab-heading><i class="icon-bell"></i> Alert me!</tab-heading>
          Second Tab, with alert callback and html heading!
        </tab>
        <tab ng-repeat="item in items"
          heading="{{item.title}}"
          disabled="item.disabled"
          active="item.active">
          {{item.content}}
        </tab>
      </tabset>
    </div>
  </file>
  <file name="script.js">
    function TabsDemoCtrl($scope) {
      $scope.items = [
        { title:"Dynamic Title 1", content:"Dynamic Item 0" },
        { title:"Dynamic Title 2", content:"Dynamic Item 1", disabled: true }
      ];

      $scope.alertMe = function () {
        setTimeout(function () {
          alert("You've selected the alert tab!");
        });
      };
    };
  </file>
</example>
 */

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabHeading
 * @restrict EA
 *
 * @description
 * Creates an HTML heading for a {@link ui.bootstrap.tabs.directive:tab tab}. Must be placed as a child of a tab element.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab>
        <tab-heading><b>HTML</b> in my titles?!</tab-heading>
        And some content, too!
      </tab>
      <tab>
        <tab-heading><i class="icon-heart"></i> Icon heading?!?</tab-heading>
        That's right.
      </tab>
    </tabset>
  </file>
</example>
 */
.directive('tab', ['$parse', function ($parse) {
  return {
    require: '^tabset',
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/tabs/tab.html',
    transclude: true,
    scope: {
      active: '=?',
      heading: '@',
      onSelect: '&select', //This callback is called in contentHeadingTransclude
                          //once it inserts the tab's content into the dom
      onDeselect: '&deselect'
    },
    controller: function () {
      //Empty controller so other directives can require being 'under' a tab
    },
    compile: function (elm, attrs, transclude) {
      return function postLink(scope, elm, attrs, tabsetCtrl) {
        scope.$watch('active', function (active) {
          if (active) {
            tabsetCtrl.select(scope);
          }
        });

        scope.disabled = false;
        if ( attrs.disabled ) {
          scope.$parent.$watch($parse(attrs.disabled), function (value) {
            scope.disabled = !! value;
          });
        }

        scope.select = function () {
          if ( !scope.disabled ) {
            scope.active = true;
          }
        };

        tabsetCtrl.addTab(scope);
        scope.$on('$destroy', function () {
          tabsetCtrl.removeTab(scope);
        });

        //We need to transclude later, once the content container is ready.
        //when this link happens, we're inside a tab heading.
        scope.$transcludeFn = transclude;
      };
    }
  };
}])

.directive('tabHeadingTransclude', [function () {
  return {
    restrict: 'A',
    require: '^tab',
    link: function (scope, elm, attrs, tabCtrl) {
      scope.$watch('headingElement', function updateHeadingElement(heading) {
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
}])

.directive('tabContentTransclude', function () {
  return {
    restrict: 'A',
    require: '^tabset',
    link: function (scope, elm, attrs) {
      var tab = scope.$eval(attrs.tabContentTransclude);

      //Now our tab is ready to be transcluded: both the tab heading area
      //and the tab content area are loaded.  Transclude 'em both.
      tab.$transcludeFn(tab.$parent, function (contents) {
        angular.forEach(contents, function (node) {
          if (isTabHeading(node)) {
            //Let tabHeadingTransclude know.
            tab.headingElement = node;
          } else {
            elm.append(node);
          }
        });
      });
    }
  };
  function isTabHeading(node) {
    return node.tagName &&  (
      node.hasAttribute('tab-heading') ||
      node.hasAttribute('data-tab-heading') ||
      node.tagName.toLowerCase() === 'tab-heading' ||
      node.tagName.toLowerCase() === 'data-tab-heading'
    );
  }
})

;

angular.module('ui.bootstrap.timepicker', [])

.constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: true,
  meridians: null,
  readonlyInput: false,
  mousewheel: true
})

.controller('TimepickerController', ['$scope', '$attrs', '$parse', '$log', '$locale', 'timepickerConfig', function ($scope, $attrs, $parse, $log, $locale, timepickerConfig) {
  var selected = new Date(),
      ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
      meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

  this.init = function ( ngModelCtrl_, inputs ) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    var hoursInputEl = inputs.eq(0),
        minutesInputEl = inputs.eq(1);

    var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;
    if ( mousewheel ) {
      this.setupMousewheelEvents( hoursInputEl, minutesInputEl );
    }

    $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
    this.setupInputEvents( hoursInputEl, minutesInputEl );
  };

  var hourStep = timepickerConfig.hourStep;
  if ($attrs.hourStep) {
    $scope.$parent.$watch($parse($attrs.hourStep), function (value) {
      hourStep = parseInt(value, 10);
    });
  }

  var minuteStep = timepickerConfig.minuteStep;
  if ($attrs.minuteStep) {
    $scope.$parent.$watch($parse($attrs.minuteStep), function (value) {
      minuteStep = parseInt(value, 10);
    });
  }

  // 12H / 24H mode
  $scope.showMeridian = timepickerConfig.showMeridian;
  if ($attrs.showMeridian) {
    $scope.$parent.$watch($parse($attrs.showMeridian), function (value) {
      $scope.showMeridian = !!value;

      if ( ngModelCtrl.$error.time ) {
        // Evaluate from template
        var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
        if (angular.isDefined( hours ) && angular.isDefined( minutes )) {
          selected.setHours( hours );
          refresh();
        }
      } else {
        updateTemplate();
      }
    });
  }

  // Get $scope.hours in 24H mode if valid
  function getHoursFromTemplate ( ) {
    var hours = parseInt( $scope.hours, 10 );
    var valid = ( $scope.showMeridian ) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
    if ( !valid ) {
      return undefined;
    }

    if ( $scope.showMeridian ) {
      if ( hours === 12 ) {
        hours = 0;
      }
      if ( $scope.meridian === meridians[1] ) {
        hours = hours + 12;
      }
    }
    return hours;
  }

  function getMinutesFromTemplate() {
    var minutes = parseInt($scope.minutes, 10);
    return ( minutes >= 0 && minutes < 60 ) ? minutes : undefined;
  }

  function pad( value ) {
    return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
  }

  // Respond on mousewheel spin
  this.setupMousewheelEvents = function ( hoursInputEl, minutesInputEl ) {
    var isScrollingUp = function (e) {
      if (e.originalEvent) {
        e = e.originalEvent;
      }
      //pick correct delta variable depending on event
      var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
      return (e.detail || delta > 0);
    };

    hoursInputEl.bind('mousewheel wheel', function (e) {
      $scope.$apply( (isScrollingUp(e)) ? $scope.incrementHours() : $scope.decrementHours() );
      e.preventDefault();
    });

    minutesInputEl.bind('mousewheel wheel', function (e) {
      $scope.$apply( (isScrollingUp(e)) ? $scope.incrementMinutes() : $scope.decrementMinutes() );
      e.preventDefault();
    });

  };

  this.setupInputEvents = function ( hoursInputEl, minutesInputEl ) {
    if ( $scope.readonlyInput ) {
      $scope.updateHours = angular.noop;
      $scope.updateMinutes = angular.noop;
      return;
    }

    var invalidate = function (invalidHours, invalidMinutes) {
      ngModelCtrl.$setViewValue( null );
      ngModelCtrl.$setValidity('time', false);
      if (angular.isDefined(invalidHours)) {
        $scope.invalidHours = invalidHours;
      }
      if (angular.isDefined(invalidMinutes)) {
        $scope.invalidMinutes = invalidMinutes;
      }
    };

    $scope.updateHours = function () {
      var hours = getHoursFromTemplate();

      if ( angular.isDefined(hours) ) {
        selected.setHours( hours );
        refresh( 'h' );
      } else {
        invalidate(true);
      }
    };

    hoursInputEl.bind('blur', function (e) {
      if ( !$scope.invalidHours && $scope.hours < 10) {
        $scope.$apply( function () {
          $scope.hours = pad( $scope.hours );
        });
      }
    });

    $scope.updateMinutes = function () {
      var minutes = getMinutesFromTemplate();

      if ( angular.isDefined(minutes) ) {
        selected.setMinutes( minutes );
        refresh( 'm' );
      } else {
        invalidate(undefined, true);
      }
    };

    minutesInputEl.bind('blur', function (e) {
      if ( !$scope.invalidMinutes && $scope.minutes < 10 ) {
        $scope.$apply( function () {
          $scope.minutes = pad( $scope.minutes );
        });
      }
    });

  };

  this.render = function () {
    var date = ngModelCtrl.$modelValue ? new Date( ngModelCtrl.$modelValue ) : null;

    if ( isNaN(date) ) {
      ngModelCtrl.$setValidity('time', false);
      $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
    } else {
      if ( date ) {
        selected = date;
      }
      makeValid();
      updateTemplate();
    }
  };

  // Call internally when we know that model is valid.
  function refresh( keyboardChange ) {
    makeValid();
    ngModelCtrl.$setViewValue( new Date(selected) );
    updateTemplate( keyboardChange );
  }

  function makeValid() {
    ngModelCtrl.$setValidity('time', true);
    $scope.invalidHours = false;
    $scope.invalidMinutes = false;
  }

  function updateTemplate( keyboardChange ) {
    var hours = selected.getHours(), minutes = selected.getMinutes();

    if ( $scope.showMeridian ) {
      hours = ( hours === 0 || hours === 12 ) ? 12 : hours % 12; // Convert 24 to 12 hour system
    }

    $scope.hours = keyboardChange === 'h' ? hours : pad(hours);
    $scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
    $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
  }

  function addMinutes( minutes ) {
    var dt = new Date( selected.getTime() + minutes * 60000 );
    selected.setHours( dt.getHours(), dt.getMinutes() );
    refresh();
  }

  $scope.incrementHours = function () {
    addMinutes( hourStep * 60 );
  };
  $scope.decrementHours = function () {
    addMinutes( - hourStep * 60 );
  };
  $scope.incrementMinutes = function () {
    addMinutes( minuteStep );
  };
  $scope.decrementMinutes = function () {
    addMinutes( - minuteStep );
  };
  $scope.toggleMeridian = function () {
    addMinutes( 12 * 60 * (( selected.getHours() < 12 ) ? 1 : -1) );
  };
}])

.directive('timepicker', function () {
  return {
    restrict: 'EA',
    require: ['timepicker', '?^ngModel'],
    controller:'TimepickerController',
    replace: true,
    scope: {},
    templateUrl: 'template/timepicker/timepicker.html',
    link: function (scope, element, attrs, ctrls) {
      var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if ( ngModelCtrl ) {
        timepickerCtrl.init( ngModelCtrl, element.find('input') );
      }
    }
  };
});

angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
  .factory('typeaheadParser', ['$parse', function ($parse) {

  //                      00000111000000000000022200000000000000003333333333333330000000000044000
  var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;

  return {
    parse:function (input) {

      var match = input.match(TYPEAHEAD_REGEXP);
      if (!match) {
        throw new Error(
          'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
            ' but got "' + input + '".');
      }

      return {
        itemName:match[3],
        source:$parse(match[4]),
        viewMapper:$parse(match[2] || match[1]),
        modelMapper:$parse(match[1])
      };
    }
  };
}])

  .directive('typeahead', ['$compile', '$parse', '$q', '$timeout', '$document', '$position', 'typeaheadParser',
    function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {

  var HOT_KEYS = [9, 13, 27, 38, 40];

  return {
    require:'ngModel',
    link:function (originalScope, element, attrs, modelCtrl) {

      //SUPPORTED ATTRIBUTES (OPTIONS)

      //minimal no of characters that needs to be entered before typeahead kicks-in
      var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;

      //minimal wait time after last character typed before typehead kicks-in
      var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

      //should it restrict model values to the ones selected from the popup only?
      var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;

      //binding to a variable that indicates if matches are being retrieved asynchronously
      var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

      //a callback executed when a match is selected
      var onSelectCallback = $parse(attrs.typeaheadOnSelect);

      var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

      var appendToBody =  attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : false;

      //INTERNAL VARIABLES

      //model setter executed upon match selection
      var $setModelValue = $parse(attrs.ngModel).assign;

      //expressions used by typeahead
      var parserResult = typeaheadParser.parse(attrs.typeahead);

      var hasFocus;

      //create a child scope for the typeahead directive so we are not polluting original scope
      //with typeahead-specific data (matches, query etc.)
      var scope = originalScope.$new();
      originalScope.$on('$destroy', function (){
        scope.$destroy();
      });

      // WAI-ARIA
      var popupId = 'typeahead-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
      element.attr({
        'aria-autocomplete': 'list',
        'aria-expanded': false,
        'aria-owns': popupId
      });

      //pop-up element used to display matches
      var popUpEl = angular.element('<div typeahead-popup></div>');
      popUpEl.attr({
        id: popupId,
        matches: 'matches',
        active: 'activeIdx',
        select: 'select(activeIdx)',
        query: 'query',
        position: 'position'
      });
      //custom item template
      if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
        popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
      }

      var resetMatches = function () {
        scope.matches = [];
        scope.activeIdx = -1;
        element.attr('aria-expanded', false);
      };

      var getMatchId = function (index) {
        return popupId + '-option-' + index;
      };

      // Indicate that the specified match is the active (pre-selected) item in the list owned by this typeahead.
      // This attribute is added or removed automatically when the `activeIdx` changes.
      scope.$watch('activeIdx', function (index) {
        if (index < 0) {
          element.removeAttr('aria-activedescendant');
        } else {
          element.attr('aria-activedescendant', getMatchId(index));
        }
      });

      var getMatchesAsync = function (inputValue) {

        var locals = {$viewValue: inputValue};
        isLoadingSetter(originalScope, true);
        $q.when(parserResult.source(originalScope, locals)).then(function (matches) {

          //it might happen that several async queries were in progress if a user were typing fast
          //but we are interested only in responses that correspond to the current view value
          var onCurrentRequest = (inputValue === modelCtrl.$viewValue);
          if (onCurrentRequest && hasFocus) {
            if (matches.length > 0) {

              scope.activeIdx = 0;
              scope.matches.length = 0;

              //transform labels
              for(var i=0; i<matches.length; i++) {
                locals[parserResult.itemName] = matches[i];
                scope.matches.push({
                  id: getMatchId(i),
                  label: parserResult.viewMapper(scope, locals),
                  model: matches[i]
                });
              }

              scope.query = inputValue;
              //position pop-up with matches - we need to re-calculate its position each time we are opening a window
              //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
              //due to other elements being rendered
              scope.position = appendToBody ? $position.offset(element) : $position.position(element);
              scope.position.top = scope.position.top + element.prop('offsetHeight');

              element.attr('aria-expanded', true);
            } else {
              resetMatches();
            }
          }
          if (onCurrentRequest) {
            isLoadingSetter(originalScope, false);
          }
        }, function (){
          resetMatches();
          isLoadingSetter(originalScope, false);
        });
      };

      resetMatches();

      //we need to propagate user's query so we can higlight matches
      scope.query = undefined;

      //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later
      var timeoutPromise;

      var scheduleSearchWithTimeout = function (inputValue) {
        timeoutPromise = $timeout(function () {
          getMatchesAsync(inputValue);
        }, waitTime);
      };

      var cancelPreviousTimeout = function () {
        if (timeoutPromise) {
          $timeout.cancel(timeoutPromise);
        }
      };

      //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
      //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
      modelCtrl.$parsers.unshift(function (inputValue) {

        hasFocus = true;

        if (inputValue && inputValue.length >= minSearch) {
          if (waitTime > 0) {
            cancelPreviousTimeout();
            scheduleSearchWithTimeout(inputValue);
          } else {
            getMatchesAsync(inputValue);
          }
        } else {
          isLoadingSetter(originalScope, false);
          cancelPreviousTimeout();
          resetMatches();
        }

        if (isEditable) {
          return inputValue;
        } else {
          if (!inputValue) {
            // Reset in case user had typed something previously.
            modelCtrl.$setValidity('editable', true);
            return inputValue;
          } else {
            modelCtrl.$setValidity('editable', false);
            return undefined;
          }
        }
      });

      modelCtrl.$formatters.push(function (modelValue) {

        var candidateViewValue, emptyViewValue;
        var locals = {};

        if (inputFormatter) {

          locals['$model'] = modelValue;
          return inputFormatter(originalScope, locals);

        } else {

          //it might happen that we don't have enough info to properly render input value
          //we need to check for this situation and simply return model value if we can't apply custom formatting
          locals[parserResult.itemName] = modelValue;
          candidateViewValue = parserResult.viewMapper(originalScope, locals);
          locals[parserResult.itemName] = undefined;
          emptyViewValue = parserResult.viewMapper(originalScope, locals);

          return candidateViewValue!== emptyViewValue ? candidateViewValue : modelValue;
        }
      });

      scope.select = function (activeIdx) {
        //called from within the $digest() cycle
        var locals = {};
        var model, item;

        locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
        model = parserResult.modelMapper(originalScope, locals);
        $setModelValue(originalScope, model);
        modelCtrl.$setValidity('editable', true);

        onSelectCallback(originalScope, {
          $item: item,
          $model: model,
          $label: parserResult.viewMapper(originalScope, locals)
        });

        resetMatches();

        //return focus to the input element if a match was selected via a mouse click event
        // use timeout to avoid $rootScope:inprog error
        $timeout(function () { element[0].focus(); }, 0, false);
      };

      //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
      element.bind('keydown', function (evt) {

        //typeahead is open and an "interesting" key was pressed
        if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
          return;
        }

        evt.preventDefault();

        if (evt.which === 40) {
          scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
          scope.$digest();

        } else if (evt.which === 38) {
          scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
          scope.$digest();

        } else if (evt.which === 13 || evt.which === 9) {
          scope.$apply(function () {
            scope.select(scope.activeIdx);
          });

        } else if (evt.which === 27) {
          evt.stopPropagation();

          resetMatches();
          scope.$digest();
        }
      });

      element.bind('blur', function (evt) {
        hasFocus = false;
      });

      // Keep reference to click handler to unbind it.
      var dismissClickHandler = function (evt) {
        if (element[0] !== evt.target) {
          resetMatches();
          scope.$digest();
        }
      };

      $document.bind('click', dismissClickHandler);

      originalScope.$on('$destroy', function (){
        $document.unbind('click', dismissClickHandler);
      });

      var $popup = $compile(popUpEl)(scope);
      if ( appendToBody ) {
        $document.find('body').append($popup);
      } else {
        element.after($popup);
      }
    }
  };

}])

  .directive('typeaheadPopup', function () {
    return {
      restrict:'EA',
      scope:{
        matches:'=',
        query:'=',
        active:'=',
        position:'=',
        select:'&'
      },
      replace:true,
      templateUrl:'template/typeahead/typeahead-popup.html',
      link:function (scope, element, attrs) {

        scope.templateUrl = attrs.templateUrl;

        scope.isOpen = function () {
          return scope.matches.length > 0;
        };

        scope.isActive = function (matchIdx) {
          return scope.active == matchIdx;
        };

        scope.selectActive = function (matchIdx) {
          scope.active = matchIdx;
        };

        scope.selectMatch = function (activeIdx) {
          scope.select({activeIdx:activeIdx});
        };
      }
    };
  })

  .directive('typeaheadMatch', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
    return {
      restrict:'EA',
      scope:{
        index:'=',
        match:'=',
        query:'='
      },
      link:function (scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
        $http.get(tplUrl, {cache: $templateCache}).success(function (tplContent){
           element.replaceWith($compile(tplContent.trim())(scope));
        });
      }
    };
  }])

  .filter('typeaheadHighlight', function () {

    function escapeRegexp(queryToEscape) {
      return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }

    return function (matchItem, query) {
      return query ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
    };
  });

angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/accordion/accordion-group.html",
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a class=\"accordion-toggle\" ng-click=\"toggleOpen()\" accordion-transclude=\"heading\"><span ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
    "	  <div class=\"panel-body\" ng-transclude></div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("template/accordion/accordion.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/accordion/accordion.html",
    "<div class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("template/alert/alert.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/alert/alert.html",
    "<div class=\"alert\" ng-class=\"['alert-' + (type || 'warning'), closeable ? 'alert-dismissable' : null]\" role=\"alert\">\n" +
    "    <button ng-show=\"closeable\" type=\"button\" class=\"close\" ng-click=\"close()\">\n" +
    "        <span aria-hidden=\"true\">&times;</span>\n" +
    "        <span class=\"sr-only\">Close</span>\n" +
    "    </button>\n" +
    "    <div ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/carousel/carousel.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/carousel/carousel.html",
    "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\" ng-swipe-right=\"prev()\" ng-swipe-left=\"next()\">\n" +
    "    <ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\">\n" +
    "        <li ng-repeat=\"slide in slides track by $index\" ng-class=\"{active: isActive(slide)}\" ng-click=\"select(slide)\"></li>\n" +
    "    </ol>\n" +
    "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
    "    <a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides.length > 1\"><span class=\"glyphicon glyphicon-chevron-left\"></span></a>\n" +
    "    <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides.length > 1\"><span class=\"glyphicon glyphicon-chevron-right\"></span></a>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/carousel/slide.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/carousel/slide.html",
    "<div ng-class=\"{\n" +
    "    'active': leaving || (active && !entering),\n" +
    "    'prev': (next || active) && direction=='prev',\n" +
    "    'next': (next || active) && direction=='next',\n" +
    "    'right': direction=='prev',\n" +
    "    'left': direction=='next'\n" +
    "  }\" class=\"item text-center\" ng-transclude></div>\n" +
    "");
}]);

angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/datepicker/datepicker.html",
    "<div ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
    "  <daypicker ng-switch-when=\"day\" tabindex=\"0\"></daypicker>\n" +
    "  <monthpicker ng-switch-when=\"month\" tabindex=\"0\"></monthpicker>\n" +
    "  <yearpicker ng-switch-when=\"year\" tabindex=\"0\"></yearpicker>\n" +
    "</div>");
}]);

angular.module("template/datepicker/day.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/datepicker/day.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n" +
    "      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/datepicker/month.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/datepicker/month.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/datepicker/popup.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
    "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\">\n" +
    "	<li ng-transclude></li>\n" +
    "	<li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
    "		<span class=\"btn-group\">\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"select('today')\">{{ getText('current') }}</button>\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"select(null)\">{{ getText('clear') }}</button>\n" +
    "		</span>\n" +
    "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"close()\">{{ getText('close') }}</button>\n" +
    "	</li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("template/datepicker/year.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/datepicker/year.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"3\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/modal/backdrop.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/modal/backdrop.html",
    "<div class=\"modal-backdrop fade {{ backdropClass }}\"\n" +
    "     ng-class=\"{in: animate}\"\n" +
    "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
    "></div>\n" +
    "");
}]);

angular.module("template/modal/window.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/modal/window.html",
    "<div tabindex=\"-1\" role=\"dialog\" class=\"modal fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
    "    <div class=\"modal-dialog\" ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\"><div class=\"modal-content\" modal-transclude></div></div>\n" +
    "</div>");
}]);

angular.module("template/pagination/pager.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/pagination/pager.html",
    "<ul class=\"pager\">\n" +
    "  <li ng-class=\"{disabled: noPrevious(), previous: align}\"><a href ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-class=\"{disabled: noNext(), next: align}\"><a href ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(1)\">{{getText('first')}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active}\"><a href ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(totalPages)\">{{getText('last')}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" bind-html-unsafe=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/popover/popover-template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/popover/popover-template.html",
    "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
    "      <div class=\"popover-content\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/popover/popover.html",
    "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/progressbar/bar.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: percent + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progress.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/progressbar/progress.html",
    "<div class=\"progress\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/progressbar/progressbar.html",
    "<div class=\"progress\">\n" +
    "  <div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: percent + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("template/rating/rating.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/rating/rating.html",
    "<span ng-mouseleave=\"reset()\" ng-keydown=\"onKeydown($event)\" tabindex=\"0\" role=\"slider\" aria-valuemin=\"0\" aria-valuemax=\"{{range.length}}\" aria-valuenow=\"{{value}}\">\n" +
    "    <i ng-repeat=\"r in range track by $index\" ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < value && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\">\n" +
    "        <span class=\"sr-only\">({{ $index < value ? '*' : ' ' }})</span>\n" +
    "    </i>\n" +
    "</span>");
}]);

angular.module("template/tabs/tab.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "  <a ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("template/tabs/tabset.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/tabs/tabset.html",
    "<div>\n" +
    "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs\" \n" +
    "         ng-class=\"{active: tab.active}\"\n" +
    "         tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
    "<table>\n" +
    "	<tbody>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"incrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"incrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "		<tr>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "				<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td>:</td>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "				<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td ng-show=\"showMeridian\"><button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button></td>\n" +
    "		</tr>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"decrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"decrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/typeahead/typeahead-match.html",
    "<a tabindex=\"-1\" bind-html-unsafe=\"match.label | typeaheadHighlight:query\"></a>");
}]);

angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/typeahead/typeahead-popup.html",
    "<ul class=\"dropdown-menu\" ng-show=\"isOpen()\" ng-style=\"{top: position.top+'px', left: position.left+'px'}\" style=\"display: block;\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
    "    <li ng-repeat=\"match in matches track by $index\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\" role=\"option\" id=\"{{match.id}}\">\n" +
    "        <div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
    "    </li>\n" +
    "</ul>");
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
angular.module('Orion.Directives', []);
angular.module('Orion.Services', ['ngRoute', 'ngResource', 'ngCookies' ]);

angular.module('Orion', [
  'CommonControllers',
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
  // 'LocationApp',
  'PartApp',
  //'StateApp',
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
