angular.module('MCDiligenceApp.Controllers')
    .controller('MCDiligenceCtrl', ['$scope',
        '$http',
        '$timeout',
        '$location',
        '$q',
        'ApiRequestService',
        'DateService',
        'AlertService',
        function ($scope, $http, $timeout, $location, $q, ApiRequestService, DateService,
            AlertService) {
            // Variables-----------------------------------------
            const ARS = ApiRequestService;              // local
            const DS = DateService;                     // local
            $scope.infiniteScroll = false              // local
            $scope.unitCount = 0                       // local
            $scope.loaded = false;                      // local
            $scope.spinner = true;                      // local
            $scope.reportDisabled = false;
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
                $scope.infiniteScroll = false
                ARS.MCUnitDiligenceForms(query)
                    .then((mcUnitDiligenceForms) => {
                        $scope.mcUnitDiligenceForms = mcUnitDiligenceForms.map(
                            mapMCUnitDiligenceForms);
                        $scope.loaded = true;
                        $scope.spinnerOff();
                        ARS.http.get.MCUnitDiligenceFormCount(query)
                            .then((res) => {
                                $scope.unitCount = res.data
                                if (query.skip, $scope.unitCount) {
                                    query.skip += query.limit
                                    $scope.infiniteScroll = true
                                    $scope.MCDiligenceScrollLookup(query)
                                }
                            }, (err) => {
                                console.error(`Counting Error: ${err}`)
                            })
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
                        if ($scope.infiniteScroll) {
                            if (query.skip < $scope.unitCount) {
                                query.skip += query.limit
                                $scope.infiniteScroll = true
                                $scope.MCDiligenceScrollLookup(query)
                            } else if ($scope.mcUnitDiligenceForms.length === $scope.unitCount) {
                                $scope.infiniteScroll = false
                            }
                        }
                    })
                    .catch((err) => console.log('Failed to load diligence forms on scroll: ', err));
            };
            // --------------------------------------------------

            $scope.mcUnitDiligenceReport = (query) => {
                $http({method: 'GET', url: 'api/MCUnitDiligenceFormsReport', params: query})
                    .then((res) => {
                        const anchor = angular.element('<a/>');
                        anchor.attr({
                            href:     'data:attachment/tsv;charset=utf-8,' + encodeURI(res.data),
                            target:   '_blank',
                            download: 'MCUnitDiligenceReport.tsv',
                        })[0].click();
                        $scope.reportDisabled = false;
                    }, (err) => {
                        AlertService.add('danger', 'Report failed', 2000);
                        console.log(err);
                        $scope.reportDisabled = false;
                    });
            };

            // Create Sorting parameters ------------------------
            function mapMCUnitDiligenceForms (mcd) {
                // map and set times to local times
                mcd.submitted = new Date(mcd.submitted);
                mcd.epoch = new Date(mcd.submitted).getTime();

                return mcd;
            }

            // --------------------------------------------------
        }]);
