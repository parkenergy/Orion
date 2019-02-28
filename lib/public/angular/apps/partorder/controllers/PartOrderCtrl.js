function PartOrderCtrl ($scope, $http, $timeout, $location, $q, $cookies, AlertService, LocationItemService, ApiRequestService, locations, DateService) {
    // Variables-----------------------------------------
    const ARS = ApiRequestService
    const DS = DateService
    $scope.loaded = false
    $scope.spinner = true
    $scope.POSearchCount = 0
    $scope.infiniteScroll = false
    $scope.locations = locations
    // --------------------------------------------------

    // Turn Spinner Off ---------------------------------
    $scope.spinnerOff = () => {
        $scope.spinner = false
    }
    $scope.spinnerOn = () => {
        $scope.spinner = true
    }
    // --------------------------------------------------

    // Make the po go into the list of pos to send to next page
    $scope.listIt = (po) => {
        po.inList = !!po.inList
    }
    // --------------------------------------------------

    // Passed to Component ------------------------------
    // Function called any time Page loads or user scrolls past 50 units
    $scope.lookup = (query) => {
        query.skip = 0
        $scope.infiniteScroll = false
        $scope.loaded = false
        $scope.spinnerOn()
        console.log('Looking up Part Orders...')
        ARS.PartOrders(query)
           .then((partorders) => {
               console.log('Part Orders Loaded.')
               $scope.partorders = partorders.map(mapPartOrders)
               $scope.loaded = true
               $scope.spinnerOff()
               ARS.http.get.PartOrdersNoIdentityCount(query)
                  .then((res) => {
                      $scope.POSearchCount = res.data
                      if (query.skip < $scope.POSearchCount) {
                          query.skip += query.limit
                          $scope.infiniteScroll = true
                          $scope.PartOrderScrollLookup(query)
                      }
                  }, (err) => {
                      console.error(`Counting PO Error: ${err}`)
                  })
           })
           .catch((err) => console.log('Failed to load: ', err))
    }

    $scope.$on('$destroy', function () {
        $scope.infiniteScroll = false
    })

    $scope.report = (query) => {
        $http({
            cache:  false,
            method: 'GET',
            url:    'api/PartOrderDump',
            params: query,
        })
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'application/octet-stream;charset=utrf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'PartsReport.csv')
                } else {
                    rawFile = 'data:' + strMimeType + ',' + encodeURIComponent(res.data)
                    a.setAttribute('target', '_blank')
                }
                a.href = rawFile
                a.setAttribute('style', 'display:none;')
                D.body.appendChild(a)
                setTimeout(function () {
                    if (a.click) {
                        a.click()
                        // Workaround for Safari 5
                    } else if (document.createEvent) {
                        const eventObj = document.createEvent('MouseEvents')
                        eventObj.initEvent('click', true, true)
                        a.dispatchEvent(eventObj)
                    }
                    D.body.removeChild(a)

                }, 100)
            }, (err) => {
                AlertService.add('danger', 'Report failed to load', 2000)
                console.log(err)
            })
        /*$http({method: 'GET', url: '/api/partorders', params: query})
            .then((res) => {
                    const anchor = angular.element('<a/>')
                    anchor.attr({
                        href:     'data:attachment/csv;charset=utf-8,' + encodeURI(res.data),
                        target:   '_blank',
                        download: 'PartsReport.csv',
                    })[0].click()
                },
                (err) => {
                    AlertService.add('danger', 'Report failed to load', 2000)
                    console.log(err)
                },
            )*/
    }

    $scope.PartOrderScrollLookup = (query) => {
        console.log('Looking up Part Orders...')
        ARS.PartOrders(query)
           .then((partorders) => {
               console.log('Part Orders Loaded.')
               const po = partorders.map(mapPartOrders)
               $scope.partorders = $scope.partorders.concat(po)
               if ($scope.infiniteScroll) {
                   if (query.skip < $scope.POSearchCount) {
                       query.skip += query.limit
                       $scope.infiniteScroll = true
                       $scope.PartOrderScrollLookup(query)
                   } else if ($scope.partorders.length === $scope.POSearchCount) {
                       $scope.infiniteScroll = false
                   }
               }
           })
           .catch((err) => console.log('Failed to load part orders: ', err))
    }
    // --------------------------------------------------

    // Create sorting parameters ------------------------
    function mapPartOrders (po) {
        po.timeSubmitted = DS.displayLocal(new Date(po.timeSubmitted))
        po.epoch = new Date(po.timeSubmitted).getTime()
        po.destination = LocationItemService.getNameFromNSID(po.destinationNSID, $scope.locations)
        po.inList = !!po.inList

        return po
    }

    // --------------------------------------------------

    // Routing ------------------------------------------
    $scope.createPartOrder = () => {
        $location.url('/partorder/create')
    }
    // --------------------------------------------------
}
angular.module('PartOrderApp.Controllers')
       .controller('PartOrderCtrl',
           ['$scope', '$http', '$timeout', '$location', '$q', '$cookies', 'AlertService', 'LocationItemService', 'ApiRequestService', 'locations', 'DateService', PartOrderCtrl]);
