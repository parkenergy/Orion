angular.module('UnitApp.Components')
  .component('unitMap', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitMap.html',
    bindings: {
      units: '<',
      bounds: '<'
    },
    controller: ['$scope', class UnitMapCtrl {
      constructor($scope) {
        // Map creation and events ----------------------------
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 4,
          mapEvents: {
            click: (marker, eventName, model) => {
              const thisMarker = {
                id: 0,
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
              this.map.unitInfoWindow.show = false;
            }
          },
          CoordInfoWindow: {
            marker: { id: 0 },
            show: false,
            closeClick: function() {
              this.show = false;
            }
          },
        // ----------------------------------------------------
  
        // Markers and events for Units -----------------------
          unitMarkerEvents: {
            click: (marker, eventName, model) => {
              this.map.unitInfoWindow.model = model;
              this.map.unitInfoWindow.show = true;
              this.map.CoordInfoWindow.show = true;
            }
          },
          unitInfoWindow: {
            marker: {},
            show: false,
            closeClick: function() {
              this.show = true;
            }
          }
        // ----------------------------------------------------
        };
        this.options = { scrollwheel: false };
        console.log('End of UnitMap');
      }
      
      $onInit() {
        setTimeout(() => {
          this.showMap = true;
          const mapOptions = {
            center: { lat: this.map.center.latitude, lng: this.map.center.longitude },
            zoom: this.map.zoom,
            scrollwheel: this.options.scrollwheel
          };
          const mapElement = document.getElementById('unitMap');
          this.mapInstance = new google.maps.Map(mapElement, mapOptions);
        }, 100);
      }
    }]
  });