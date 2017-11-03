angular.module('UnitApp.Components')
  .component('unitSat', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSat.html',
    bindings: {
      unit: '<'
    },
    controller: ['$scope', '$timeout', 'uiGmapGoogleMapApi', class UnitSatCtrl {
      constructor($scope, $timeout, uiGmapGoogleMapApi) {
        this.showMap = false;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.ui = uiGmapGoogleMapApi;
        // Map creation and events ----------------------------
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 18,
          bounds: {},
          mapEvents: {
            click: (marker, eventName, model) => {
              const thisMarker = {
                id: 1,
                geo: {
                  type: 'Point',
                  coordinates: [0.0, 0.0]
                }
              };
              thisMarker.geo.coordinates[0] = model[0].latLng.lng().toFixed(6);
              thisMarker.geo.coordinates[1] = model[0].latLng.lat().toFixed(6);
              this.map.CoordInfoWindow.marker = thisMarker;
              // need to re-render map when new marker is placed on click
              $scope.$apply();
            }
          },
          options: {
            pixelOffset: {
              width: -1,
              height: -45
            }
          },
        // ----------------------------------------------------
  
        // Marker and events for finding Coordinates ----------
          CoordMarkerEvents: {
            click: (marker, eventName, model) => {
              this.map.CoordInfoWindow.model = model;
              this.map.CoordInfoWindow.show = true;
            }
          },
          CoordInfoWindow: {
            marker: {id: 1},
            show: false,
            closeClick: function() {
              this.show = false;
            }
          }
        // ----------------------------------------------------
        };

        this.options = {scrollwheel: false, mapTypeId: google.maps.MapTypeId.SATELLITE};
      }
      // ----------------------------------------------------

      // Initialize map and add unit marker -----------------
      $onInit() {
        this.map.center = _.cloneDeep(this.unit.geo);
  
        let now = new Date();
        let inSevenDays = moment().add(7, 'days');
        
        let pmDate = this.unit.nextPmDate ? new Date(this.unit.nextPmDate) : null;
  
        let icon = 'lib/public/images/marker_grey.png';
        if(pmDate) {
          //If pmDate has passed, icon is red
          if (moment(now).isAfter(pmDate, 'day')) {
            icon = 'lib/public/images/marker_red.png';
          }
          //If pmDate is under 7 days away, icon is yellow
          else if(moment(inSevenDays).isAfter(pmDate, 'day')) {
            icon = 'lib/public/images/marker_yellow.png';
          }
          //pmDate hasn't passed and is more than 7 days away
          else {
            icon = 'lib/public/images/marker_green.png';
          }
        }
  
        this.marker = {
          id: 0,
          geo: this.unit.geo,
          options: {
            icon
          }
        };
        
        this.ui.then(() => {
          this.$timeout(() => {
            this.showMap = true;
          }, 100)
        })
        
      }
      // ----------------------------------------------------
    }]
  });
