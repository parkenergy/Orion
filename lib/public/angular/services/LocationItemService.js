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

  // get all info from the truck ID itself ---------
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
  // -----------------------------------------------

  // get Truck Id From Name based On NSID ----------
  LocationItemService.getTruckFromNSID = function (nsid, locations) {
    var returnString = '';
    _.map(locations, function (obj) {
      if(obj.netsuiteId === nsid){
        returnString = obj.name.substr(obj.name.indexOf(":") + 1).trim();
      }
    });
    return returnString;
  };
  // -----------------------------------------------

  // get the _id of a particular Location based on NSID
  LocationItemService.getIDFromNSID = function (nsid, locations) {
    var returnVariable = null;
    if(nsid){
      _.map(locations, function (obj) {
        if(obj.netsuiteId === nsid){
          returnVariable = obj._id;
        }
      });
    }
    return returnVariable;
  };
  // -----------------------------------------------

  // get Name from location NSID -------------------
  LocationItemService.getNameFromNSID = function (nsid, locations) {
    var returnString = '';
    if(nsid){
      _.map(locations, function (obj) {
        if (obj.netsuiteId === nsid){
          returnString = obj.name;
        }
      });
    }
    return returnString;
  };
  // -----------------------------------------------

  // get the NSID back from a locations based on ID
  LocationItemService.getLocationNSID = function (id, locations) {
    for (var i = 0; i < locations.length; i++) {
      if (locations[i]._id === id) {
        return locations[i].netsuiteId;
      }
    }
    return null;
  };
  // -----------------------------------------------

  // get Location Objects of only Trucks -----------
  LocationItemService.getTruckObj = function (locations) {
    var Truck = function () {
      return {
        name: '',
        netsuiteId: '',
        _id: null
      };
    };
    var reg = /^\d+$/;
    var returnArray = [];

    _.map(locations, function (obj) {
      if(obj.name.indexOf(":") != -1){
        if(reg.test(obj.name.substr(obj.name.indexOf(":") + 1).trim())){
          var thisLocation = Truck();
          thisLocation.name = obj.name;
          thisLocation.netsuiteId = obj.netsuiteId;
          thisLocation._id = obj._id;
          returnArray.push(thisLocation);
        }
      }
    });

    return returnArray;
  };
  // -----------------------------------------------

  // return Array of location Names ----------------
  // only warehouses
  LocationItemService.getLocationNameArray = function (locations) {
    function ClassLocations () { return { name: ''}; }
    //var defaultLocation = ClassLocations();
    var returnedArray = [];

    // fill the rest of the array with the other warehouse IDs
    _.map(locations, function (obj) {
      if ( obj.name.indexOf(":") === -1 ) {
        var thisLocation = ClassLocations();
        thisLocation.name = obj.name;
        returnedArray.push(thisLocation);
      }
    });


    return returnedArray;
  };
  // -----------------------------------------------

  // return Array of location Warehouse Objs -------
  // only for warehouses
  LocationItemService.getLocationWarehouseObjArray = function (locations) {
    function ClassLocation () {
      return {
        name: '',
        netsuiteId: '',
        _id: null
      }
    }
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

    return returnedArray;
  };
  // -----------------------------------------------

  return LocationItemService;
}]);
