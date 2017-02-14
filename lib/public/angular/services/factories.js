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

.factory('ActivityTypes', ['$resource', function ($resource) {
  return $resource('/api/activitytypes/:id', {id: '@id'});
}])

.factory('ApplicationTypes', ['$resource', function ($resource) {
  return $resource('/api/applicationtypes/:id', {id: '@id'});
}])

.factory('AssetTypes', ['$resource', function ($resource) {
  return $resource('/api/assettypes/:id', {id: '@id'});
}])
       
.factory('Areas', ['$resource', function ($resource) {
  return $resource('/api/areas/:id', {id: '@id'});
}])

.factory('CallReports', ['$resource', function ($resource) {
  return $resource('/api/callreports/:id', {id: '@id'});
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

.factory('EditHistories', ['$resource', function($resource){
  return $resource('/api/edithistories/:id', {id: '@id'});
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

.factory('OppTypes', ['$resource', function ($resource) {
  return $resource('/api/opptypes/:id', {id: '@id'});
}])

.factory('OpportunitySizes', ['$resource', function ($resource) {
  return $resource('/api/opportunitysizes/:id', {id: '@id'});
}])

.factory('Parts', ['$resource', function ($resource) {
  return $resource('/api/parts/:id', {id: '@id'});
}])

.factory('PartOrders', ['$resource', function ($resource) {
  return $resource('/api/partorders/:id', { id: '@id'},
    {
      update: {
        method: 'PUT',
        params: {id: '@id'}
      }
    })
}])

.factory('ReviewNotes', ['$resource', function($resource){
  return $resource('/api/reviewnotes/:id', {id: '@id'});
}])

.factory('States', ['$resource', function ($resource) {
  return $resource('/api/states/:id', {id: '@id'});
}])

.factory('StatusTypes', ['$resource', function ($resource) {
  return $resource('/api/statustypes/:id', {id: '@id'});
}])

.factory('Titles', ['$resource', function ($resource) {
  return $resource('/api/titles/:id', {id: '@id'});
}])

.factory('Transfers', ['$resource', function ($resource) {
  return $resource('/api/transfers/:id', {id: '@id'});
}])

.factory('Units', ['$resource', function ($resource) {
  return $resource('/api/units/:id', {id: '@id'});
}])

.factory('UnitTypes', ['$resource', function ($resource) {
  return $resource('/api/unittypes/:id', {id: '@id'});
}])

.factory('Users', ['$resource', function ($resource) {
  return $resource('/api/users/:id', {id: '@id'});
}])

.factory('Vendors', ['$resource', function ($resource) {
  return $resource('/api/vendors/:id', {id: '@id'});
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

