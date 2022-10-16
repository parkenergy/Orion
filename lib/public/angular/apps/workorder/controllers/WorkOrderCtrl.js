function WorkOrderCtrl ($window, $location, $scope, SessionService, ApiRequestService, AlertService, $http, STARTTIME, ENDTIME, WOTYPE, TECHNICIANID, DateService, me) {
    // Variables-------------------------------------------
    const SS = SessionService                 // local
    const ARS = ApiRequestService              // local
    const DS = DateService                     // local
    $scope.me = me
    $scope.infiniteScroll = false              // local
    $scope.spinner = true                      // local
    $scope.loaded = true                       // local
    $scope.WOSearchCount = 0                   // to OverviewTable
    $scope.reportDisabled = false              // to OverviewTable
    $scope.STARTTIME = STARTTIME     // to OverviewTable
    $scope.ENDTIME = ENDTIME         // to OverviewTable
    $scope.WOTYPE = WOTYPE                     // to OverviewTable
    $scope.TECHNICIANID = TECHNICIANID         // to OverviewTable
    // ----------------------------------------------------

    // Clear unit parameter from service when routing away from /myaccount
    $window.onhashchange = () => SS.drop('unitNumber')

    // Turn Spinner on and off
    $scope.spinnerOff = function () {
        $scope.spinner = false
    }
    $scope.spinnerOn = function () {
        $scope.spinner = true
    }
    // ----------------------------------------------------

    $scope.routeToCrreate = () => {
        $location.url('/workorder/create')
    }

    // Passed to Component --------------------------------
    // Function called any time page loads or user scrolls
    $scope.lookup = (query) => {
        query.skip = 0
        console.log('lookup')
        console.log(query)
        console.info(query)
        // quite current query if still running
        $scope.infiniteScroll = false
        const queryParams = $location.search()

        if (queryParams.unit) {
            obj.unit = queryParams
        }

        $scope.loaded = false
        $scope.spinnerOn()
        if (SS.get('unitNumber')) {
            ARS.http.get.UnitWorkOrders(query)
               .then((res) => {
                   $scope.workorders = res.data.map(mapWorkorders)
                   $scope.loaded = true
                   $scope.spinnerOff()
                   ARS.http.get.WorkOrdersNoIdentityCount(query)
                      .then((res) => {
                          $scope.WOSearchCount = res.data
                          if (query.skip < $scope.WOSearchCount) {
                              query.skip += query.limit
                              $scope.infiniteScroll = true
                              $scope.WorkOrderScrollLookup(query)
                          }
                      }, (err) => {
                          console.log(`Counting Error: ${err}`)
                      })
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
        } else {
            // load workorders based on query
            ARS.WorkOrders(query)
               .then((res) => {
                   $scope.workorders = res.map(mapWorkorders)
                   $scope.loaded = true
                   $scope.spinnerOff()
                   ARS.http.get.WorkOrderCount(query)
                      .then((res) => {
                          $scope.WOSearchCount = res.data
                          if (query.skip < $scope.WOSearchCount) {
                              query.skip += query.limit
                              $scope.infiniteScroll = true
                              $scope.WorkOrderScrollLookup(query)
                          }
                      }, (err) => {
                          console.log(`Counting Error: ${err}`)
                      })
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
            // get count of the same query
        }
    }

    $scope.WorkOrderScrollLookup = (query) => {
        console.log('Scroll')
        console.log(query)
        if (SS.get('unitNumber')) {
            ARS.http.get.UnitWorkOrders(query)
               .then((res) => {
                   const wo = res.data.map(mapWorkorders)
                   $scope.workorders = $scope.workorders.concat(wo)
                   if ($scope.infiniteScroll) {
                       if (query.skip < $scope.WOSearchCount) {
                           query.skip += query.limit
                           $scope.infiniteScroll = true
                           $scope.WorkOrderScrollLookup(query)
                       } else if ($scope.workorders.length === $scope.WOSearchCount) {
                           $scope.infiniteScroll = false
                       }
                   }
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
        } else {
            ARS.WorkOrders(query)
               .then((res) => {
                   const wo = res.map(mapWorkorders)
                   $scope.workorders = $scope.workorders.concat(wo)
                   if ($scope.infiniteScroll) {
                       if (query.skip < $scope.WOSearchCount) {
                           query.skip += query.limit
                           $scope.infiniteScroll = true
                           $scope.WorkOrderScrollLookup(query)
                       } else if ($scope.workorders.length === $scope.WOSearchCount) {
                           $scope.infiniteScroll = false
                       }
                   }
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
        }
    }

    /**
     * Stop Loading work orders once page is left.
     */
    $scope.$on('$destroy', function () {
        $scope.infiniteScroll = false
    })

  
    
    /**     
     * Create download link for payroll dump of workorders
     * @param query
     */
    //console.info(query)
    $scope.payrollDumpReport = (query) => {
       
        $http({
            cache: false,
            method: 'GET',
            url: '/api/WorkOrderPayrollDump',
            params: query
        })
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'application/octet-stream;charset=utf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'payrollDump.csv')
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
                AlertService.add('danger', 'Work Order Report failed', 2000)
                console.log(err)
                $scope.reportDisabled = false
            })
    }

    /**
     * Create download link for work order dump csv
     * @param query
     */
    $scope.woDumpReport = (query) => {
        $http({
            cache:  false,
            method: 'GET',
            url:    '/api/WorkOrderDump',
            params: query,
        })
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'application/octet-stream;charset=utf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'woDump.csv')
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
                AlertService.add('danger', 'Work Order Report failed', 2000)
                console.log(err)
                $scope.reportDisabled = false
            })
    }

    /**
     * Create download link for work order parts dump csv
     * @param query
     */
    $scope.woPartsDumpReport = (query) => {
        $http({method: 'GET', url: '/api/WorkorderPartDump', params: query})
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'applicaiton/octet-stream;charset=utf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'woPartsDump.tsv')
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
                $scope.reportDisabled = false
            }, (err) => {
                AlertService.add('danger', 'Work Order Parts Report failed', 2000)
                console.log(err)
                $scope.reportDisabled = false
            })
    }

    //Set fields and sanity checks
    function mapWorkorders (wo) {
        if (wo.unitNumber) wo.unitSort = Number(wo.unitNumber.replace(/\D+/g, ''))
        else wo.unitSort = 0

        if (wo.technician) wo.techName = wo.technician.firstName + ' ' + wo.technician.lastName
        else wo.techName = wo.techId

        if (wo.header) {
            if (!wo.header.customerName) wo.header.customerName = ''
            wo.customerName = wo.header.customerName
            wo.locationName = wo.header.leaseName
            if (wo.header.state) {
                wo.stateName = wo.header.state
            } else {
                wo.stateName = ''
            }
        } else {
            wo.stateName = ''
            wo.customerName = ''
            wo.locationName = ''
        }

        if (wo.timeStarted) {
            wo.timeStarted = DS.displayLocal(new Date(wo.timeStarted))
            wo.epoch = new Date(wo.timeStarted).getTime()
        } else {
            wo.epoch = 0
        }
        wo.totalMinutes = (wo.totalWoTime.hours * 60) + wo.totalWoTime.minutes
        //let displayName = "";
        if (!wo.header || !wo.header.leaseName) {
            // do nothing
        } else if (wo.header.leaseName <= 20) {
            wo.displayLocationName = wo.header.leaseName
        } else {
            wo.displayLocationName = wo.header.leaseName.slice(0, 17) + '...'
        }
        return wo
    }
}
angular.module('WorkOrderApp.Controllers').controller('WorkOrderCtrl',
    ['$window', '$location', '$scope', 'SessionService', 'ApiRequestService', 'AlertService', '$http', 'STARTTIME', 'ENDTIME', 'WOTYPE', 'TECHNICIANID', 'DateService', 'me', WorkOrderCtrl]);
