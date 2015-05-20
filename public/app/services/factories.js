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
