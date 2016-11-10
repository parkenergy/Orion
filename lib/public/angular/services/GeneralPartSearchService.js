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
