angular.module('MCDiligenceApp.Controllers')
    .controller('MCDiligenceCtrl', ['$scope',
        '$http',
        '$timeout',
        '$location',
        '$q',
        'ApiRequestService',
        'DateService',
        function ($scope, $http, $timeout, $location, $q, ApiRequestService, DateService) {
            // Variables-----------------------------------------
            const ARS = ApiRequestService;              // local
            const DS = DateService;                     // local
            $scope.loaded = false;                      // local
            $scope.spinner = true;                      // local
            // --------------------------------------------------

            // Turn Spinner Off ---------------------------------
            $scope.spinnerOff = () => {
                $scope.spinner = false;
            };
            // --------------------------------------------------

            // Passed to Component ------------------------------
            // Function called any time Page loads or user scrolls past 50 units
            $scope.lookup = (query) => {
                $scope.loaded = false;
                ARS.MCUnitDiligenceForms(query)
                    .then((mcUnitDiligenceForms) => {
                        $scope.mcUnitDiligenceForms = mcUnitDiligenceForms.map(
                            mapMCUnitDiligenceForms);
                        $scope.loaded = true;
                        $scope.spinnerOff();
                    })
                    .catch((err) => console.log('Failed to load: ', err));
            };

            $scope.MCDiligenceScrollLookup = (query) => {
                console.log('Looking up Call Reports...');
                ARS.MCUnitDiligenceForms(query)
                    .then((mcUnitDiligenceForms) => {
                        console.log('Call Reports Loaded.');
                        const cr = mcUnitDiligenceForms.map(mapMCUnitDiligenceForms);
                        $scope.mcUnitDiligenceForms = $scope.mcUnitDiligenceForms.concat(cr);
                    })
                    .catch((err) => console.log('Failed to load diligence forms on scroll: ', err));
            };
            // --------------------------------------------------

            // Create Sorting parameters ------------------------
            function mapMCUnitDiligenceForms (mcd) {
                // map and set times to local times
                mcd.callTime = DS.displayLocal(new Date(mcd.callTime));
                mcd.epoch = new Date(mcd.callTime).getTime();

                return mcd;
            }

            // --------------------------------------------------
        }]);
