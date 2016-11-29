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
  // -----------------------------------------------

  // Part Table Modal that uses other local functions to create Seach table
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
  // -----------------------------------------------

  // Add a part depending on sent param ------------
  GeneralPartSearchService.addPart = function (type, data) {
    if ( type === 'replace' ) {
      return function addPart (part) {
        console.log(part);
        data.part = GeneralPartSearchService.generalAddPart(part);
      }
    }
    if ( type === 'push' ) {
      return function addPart (part) {
        data.parts.push(GeneralPartSearchService.generalAddPart(part));
      }
    }
    if ( type === 'wo' ) {
      return function addPart (part) {
        data.parts.push(GeneralPartSearchService.woAddPart(part));
      }
    }
  };
  // -----------------------------------------------

  // Part Objects ----------------------------------
  GeneralPartSearchService.manualAddPart = function (part) {
    return {
      vendor: part.vendor,
      number: part.number,
      description: part.description,
      cost: part.cost,
      laborCode: "",
      quantity: 0,
      isBillable: false,
      isWarranty: false,
      isManual: true
    }
  };

  GeneralPartSearchService.generalAddPart = function (part) {
    return {
      vendor:         part.vendor,
      number:         part.number,
      MPN:            part.MPN,
      componentName:      part.componentName,
      description:    part.description,
      quantity:       0,
      isBillable:     false,
      isWarranty:     false,
      isManual:       false,
      netsuiteId:     part.netsuiteId
    }
  };

  GeneralPartSearchService.woAddPart = function (part) {
    return {
      vendor:         part.vendor,
      number:         part.number,
      MPN:            part.MPN,
      smartPart:      part.componentName,
      description:    part.description,
      quantity:       0,
      cost:           0,
      laborCode:      "",
      isBillable:     false,
      isWarranty:     false,
      isManual:       false,
      netsuiteId:     part.netsuiteId
    }
  };
  // -----------------------------------------------
  return GeneralPartSearchService;
}]);
