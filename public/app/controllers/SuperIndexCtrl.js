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
