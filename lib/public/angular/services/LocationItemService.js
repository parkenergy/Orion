angular.module('CommonServices')
.factory('LocationItemService',[function () {
  const LocationItemService = {};

  // get all info from the truck ID itself ---------
  LocationItemService.getTruckInfo = (truckId, locations) => {
    // relate truckID to location NSID
    const Truck = () => ({
        truckId: '',
        netsuiteId: '',
        _id: null
      });
    
    const thisTruck = Truck();
    _.map(locations, (obj) => {
      if(obj.name.indexOf(":") !== -1){
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
  LocationItemService.getTruckFromNSID = (nsid, locations) => {
    let returnString = '';
    _.map(locations, (obj) => {
      if(obj.netsuiteId === nsid){
        returnString = obj.name.substr(obj.name.indexOf(":") + 1).trim();
      }
    });
    return returnString;
  };
  // -----------------------------------------------

  // get the _id of a particular Location based on NSID
  LocationItemService.getIDFromNSID = (nsid, locations) => {
    let returnVariable = null;
    if(nsid){
      _.map(locations, (obj) => {
        if(obj.netsuiteId === nsid){
          returnVariable = obj._id;
        }
      });
    }
    return returnVariable;
  };
  // -----------------------------------------------

  // get Name from location NSID -------------------
  LocationItemService.getNameFromNSID = (nsid, locations) => {
    let returnString = '';
    if(nsid){
      _.map(locations, (obj) => {
        if (obj.netsuiteId === nsid){
          returnString = obj.name;
        }
      });
    }
    return returnString;
  };
  // -----------------------------------------------

  // get the NSID back from a locations based on ID
  LocationItemService.getLocationNSID = (id, locations) => {
    for (let i = 0; i < locations.length; i++) {
      if (locations[i]._id === id) {
        return locations[i].netsuiteId;
      }
    }
    return null;
  };
  // -----------------------------------------------

  // get Location Objects of only Trucks -----------
  LocationItemService.getTruckObj = (locations) => {
    const Truck = () => ({
        name: '',
        netsuiteId: '',
        _id: null
      });
    const reg = /^\d+$/;
    const returnArray = [];

    _.map(locations, (obj) => {
      if(obj.name.indexOf(":") !== -1){
        if(reg.test(obj.name.substr(obj.name.indexOf(":") + 1).trim())){
          const thisLocation = Truck();
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
  LocationItemService.getLocationNameArray = (locations) => {
    const ClassLocations = () => ({ name: ''});
    //var defaultLocation = ClassLocations();
    const returnedArray = [];

    // fill the rest of the array with the other warehouse IDs
    _.map(locations, (obj) => {
      if ( obj.name.indexOf(":") === -1 ) {
        const thisLocation = ClassLocations();
        thisLocation.name = obj.name;
        returnedArray.push(thisLocation);
      }
    });


    return returnedArray;
  };
  // -----------------------------------------------

  // return Array of location Warehouse Objs -------
  // only for warehouses
  LocationItemService.getLocationWarehouseObjArray = (locations) => {
    const ClassLocation = () => ({
      name: '',
      netsuiteId: '',
      _id: null
    });
    const returnedArray = [];

    // fill the rest of the array with the other warehouse info
    _.map(locations, (obj) => {
      if ( obj.name.indexOf(":") === -1 ) {
        const thisLocation = ClassLocation();
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
