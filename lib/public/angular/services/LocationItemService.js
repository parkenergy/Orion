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
