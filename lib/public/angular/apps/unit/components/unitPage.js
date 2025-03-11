angular.module('UnitApp.Components')
  .component('unitPage', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitPage.html',
    bindings: {
      coords: '<'
    },
    controller: ['$scope', '$timeout', class UnitPageCtrl {
      constructor($scope, $timeout) {
        this.showMap = false;
        this.$scope = $scope;
        this.$timeout = $timeout;
        // Map creation and events ----------------------------
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 13,
          bounds: {},
          mapEvents: {
            click: (marker, eventName, model) => {
              const thisMarker = {
                id: 3,
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
            marker: { id: 3 },
            show: false,
            closeClick: function() {
              this.show = false;
            }
          }
          // ----------------------------------------------------
        };
 
        this.options = { scrollwheel: true };
      }
      // ----------------------------------------------------
 
      // Initialize map and add unit marker -----------------
      $onInit() {
        this.map.center = { latitude: this.coords[1], longitude: this.coords[0] };
        console.log('creating Marker');
        this.marker = {
          id: 4,
          geo: { type: 'Point', coordinates: this.coords },
        };
 
        setTimeout(() => {
          this.showMap = true;
          const mapOptions = {
            center: { lat: this.map.center.latitude, lng: this.map.center.longitude },
            zoom: this.map.zoom,
            scrollwheel: this.options.scrollwheel
          };
          const mapElement = document.getElementById('unitPageMap');
          this.mapInstance = new google.maps.Map(mapElement, mapOptions);
        }, 100);
      }
    }]
  });