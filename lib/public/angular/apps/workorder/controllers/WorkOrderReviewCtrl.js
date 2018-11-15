function WorkOrderReviewCtrlFunc ($window, $http, $q, $scope,
    $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService,
    ApiRequestService, CommonWOfunctions, WorkOrders, Units, Users, ReviewNotes,
    EditHistories, workorder, reviewNotes, editHistories, me, applicationtypes,
    parts, DateService, locations, Utils, woInputMatrixes, frameModels, engineModels) {
    $scope.message = 'Review Work Order'

    const ARS = ApiRequestService
    const DS = DateService
    const {debounce} = Utils

    $scope.yards = locations.filter((loc) => {
        if (loc.name.indexOf(':') === -1) {
            return true
        }
    })
    $scope.workorder = workorder
    $scope.woInputMatrixes = woInputMatrixes
    $scope.engineModels = engineModels
    $scope.frameModels = frameModels
    $scope.parts = parts
    $scope.reviewNotes = reviewNotes
    $scope.editHistories = editHistories
    $scope.disabled = true
    $scope.me = me
    $scope.hours = getHours()
    $scope.minutes = getMinutes()
    $scope.usedLaborCodes = []
    $scope.pad = TimeDisplayService.pad
    $scope.editable = ($cookies.get('role') === 'admin')
    $scope.SyncedToNetsuite = $scope.workorder.timeSynced ||
        $scope.workorder.updated_at
    $scope.tripleInputStyling = {
        'display': 'inline-block',
        'width':   '32%',
    }
    $scope.inputStyling = {
        'display': 'inline-block',
        'width':   '49%',
    }
    $scope.workorderTypes = [
        'Corrective',
        'Trouble Call',
        'Transfer',
        'Swap',
        'New Set',
        'Release',
        'Indirect']
    // need this to be viewed on review
    $scope.applicationtypes = applicationtypes

    // Set Asset Type and Unit for display only ------------
    if ($scope.workorder.unitNumber) {
        if ($scope.workorder.unitSnapShot &&
            $scope.workorder.unitSnapShot.hasOwnProperty('number')) {
            $timeout(() => {
                $scope.displayUnit = $scope.workorder.unitSnapShot
                $scope.headerUnit = $scope.workorder.unitSnapShot
            })
        } else {
            ARS.Units({regexN: $scope.workorder.unitNumber})
               .then((units) => {
                   for (let unit in units) {
                       if (units.hasOwnProperty(unit)) {
                           if (units[unit].hasOwnProperty(
                               'productSeries')) {
                               // display unit is used in the google
                               // map view + unit checks
                               $timeout(() => {
                                   $scope.displayUnit = units[unit]
                               })
                           }
                       }
                   }
               })
               .catch((err) => console.log(err))
            ARS.Units({regexN: $scope.workorder.header.unitNumber})
               .then((units) => {
                   for (let unit in units) {
                       if (units.hasOwnProperty(unit)) {
                           if (units[unit].hasOwnProperty(
                               'productSeries')) {
                               // display unit is used in the google
                               // map view + unit checks
                               $timeout(() => {
                                   $scope.headerUnit = units[unit]
                                   console.log($scope.headerUnit)
                               })
                           }
                       }
                   }
               })
               .catch((err) => console.log(err))
        }
    }
    // ----------------------------------------------------
    $scope.isFound = (input) => {
        let show
        if ($scope.workorder.unitReadings.compressorModel) {
            $scope.woInputMatrixes.forEach(matrix => {
                if (matrix.name === input) {
                    matrix.compressors.forEach(frame => {
                        if (frame.netsuiteId === $scope.workorder.unitReadings.compressorModel) {
                            show = true
                        }
                    })
                }
            })
        }
        const engineModel = $scope.workorder.unitReadings.engineModel
        if (engineModel) {
            $scope.woInputMatrixes.forEach(matrix => {
                if (matrix.name === input) {
                    matrix.engines.forEach(engine => {
                        if (engine.netsuiteId === engineModel) {
                            show = true
                        }
                    })
                }
            })
        }
        if (!engineModel && !$scope.workorder.unitReadings.compressorModel) {
            show = false
        }
        return show
    }
    // set times to server
    const setSave = (wo) => {
        if (wo.timeStarted) {
            wo.timeStarted = DS.saveToOrion(new Date(wo.timeStarted))
        }
        if (wo.timeSubmitted) {
            wo.timeSubmitted = DS.saveToOrion(
                new Date(wo.timeSubmitted))
        }
        if (wo.timeApproved) {
            wo.timeApproved = DS.saveToOrion(new Date(wo.timeApproved))
        }
        if (wo.timeSynced) {
            wo.timeSynced = DS.saveToOrion(new Date(wo.timeSynced))
        }
    }
    // set times to display
    const setDisplay = (wo) => {
        if (wo.timeStarted) {
            wo.timeStarted = DS.displayLocal(new Date(wo.timeStarted))
        }
        if (wo.timeSubmitted) {
            wo.timeSubmitted = DS.displayLocal(
                new Date(wo.timeSubmitted))
        }
        if (wo.timeApproved) {
            wo.timeApproved = DS.displayLocal(
                new Date(wo.timeApproved))
        }
        if (wo.timeSynced) {
            wo.timeSynced = DS.displayLocal(new Date(wo.timeSynced))
        }
    }
    // init
    setDisplay($scope.workorder)

    // Add componentName to Pars in WO for listing --------
    $scope.workorder = CommonWOfunctions.addComponentNameToParts(
        $scope.workorder, $scope.parts)
    // ----------------------------------------------------

    // Elapsed time and LC time ---------------------------
    $scope.$watch('workorder', (newVal) => {
        if (newVal && $scope.workorder.hasOwnProperty('totalWoTime')) {
            $scope.totalLaborTime = TimeDisplayService.timeManager(
                $scope.workorder.totalWoTime.hours,
                $scope.workorder.totalWoTime.minutes)

        }
    }, true)
    $scope.getTimeElapsed = () => {
        const start = new Date($scope.workorder.timeStarted)
        const now = $scope.workorder.timeSubmitted ?
            new Date($scope.workorder.timeSubmitted) :
            new Date()
        // e short for elapsed
        $scope.eMilli = (now.getTime() - start.getTime()).toFixed()
        $scope.eSeconds = Math.floor((($scope.eMilli / 1000) % 60))
        $scope.eMinutes = Math.floor((($scope.eMilli / (6e4) % 60)))
        $scope.eHours = Math.floor((($scope.eMilli / (36e5))))
    }
    // ----------------------------------------------------

    // Only show labor codes that are selected ------------
    $scope.getUsedLaborCodes = () => {
        _.forEach($scope.workorder.laborCodes, (lc) => {
            _.forEach(lc, (code) => {
                if (code.hours > 0 || code.minutes > 0) {
                    if ($scope.usedLaborCodes.indexOf(code.text) ===
                        -1) {
                        $scope.usedLaborCodes.push(code.text)
                    }
                }
            })
        })
        $timeout(() => {
            $scope.getUsedLaborCodes()
        }, 500)
    }
    // ----------------------------------------------------

    // Routing and labor code hours -----------------------
    function getHours () {
        const hours = []
        for (let i = 0; i <= 24; i++) {
            hours.push(i)
        }
        return hours
    }

    function getMinutes () {
        const minutes = []
        for (let i = 0; i < 60; i += 5) {
            minutes.push(i)
        }
        return minutes
    }

    $scope.edit = () => {
        $location.path('/workorder/edit/' + $scope.workorder._id)
    }
    // ----------------------------------------------------

    // Set netsuiteSyned false ----------------------------
    const unSync = (workorder) => {
        WorkOrders.update({id: $scope.workorder._id}, workorder,
            (response) => {
                setDisplay(workorder)
            },
            (err) => {
                setDisplay(workorder)
                console.log(err)
                AlertService.add('danger',
                    'An error occurred while Unsync work order.')
            },
        )
    }
    // ----------------------------------------------------

    // NOTES ----------------------------------------------
    // create object model to data bind comment input to.
    $scope.comment = ClassNote()

    // create model object to work off of
    function ClassNote () {
        return {
            note:      '',
            workOrder: $scope.workorder._id,
        }
    }

    // boolean value to keep from editing note while it is sending
    $scope.sendingNote = false
    // save the new note to the database
    $scope.newNote = () => {
        // save to database will go here only if comment was filled
        if ($scope.comment.note) {
            $scope.sendingNote = true
            // save to database
            console.log('Saving new note...')
            ReviewNotes.save({}, $scope.comment,
                (response) => {
                    $scope.sendingNote = false
                    console.log(response)
                    console.log('Successful save.')
                    // retrieve notes to display.
                    ARS.ReviewNotes({workOrder: response.workOrder})
                       .then((newNotes) => {
                           $scope.reviewNotes = newNotes
                       })
                       .catch((err) => console.log(err))

                    // clear display note from form
                    $scope.comment.note = null
                },
                function (err) {
                    $scope.sendingNote = false
                    console.log(err)
                    console.log('Error Saving Note.')
                    $scope.comment.note = null
                },
            )
        }
    }
    // ----------------------------------------------------

    // Submissions ----------------------------------------
    // make the display for all submission history
    $scope.displaySubmissions = []

    //create display class for Submissions
    function ClassSubmission () {
        return {
            type:           '',
            firstname:      '',
            lastname:       '',
            submissionTime: Date,
        }
    }

    // only do if tech has submitted wo.
    if ($scope.workorder.timeSubmitted) {
        // Tech Submission
        ARS.getUser({id: $scope.workorder.techId})
           .then((user) => {
               let thisUser = user
               const techSubmission = ClassSubmission()
               techSubmission.type = 'Submission'
               // if user no longer exists. Deleted from db
               if (thisUser !== undefined) {
                   techSubmission.firstname = thisUser.firstName
                   techSubmission.lastname = thisUser.lastName
               } else {
                   techSubmission.firstname = $scope.workorder.techId
               }
               techSubmission.submissionTime = $scope.workorder.timeSubmitted
               $scope.displaySubmissions.push(techSubmission)
               // Manager Review
               if ($scope.workorder.timeApproved) {
                   ARS.getUser({id: $scope.workorder.approvedBy})
                      .then((manager) => {
                          thisUser = manager
                          const managerSubmission = ClassSubmission()
                          managerSubmission.type = 'Reviewed'
                          managerSubmission.firstname = thisUser.firstName
                          managerSubmission.lastname = thisUser.lastName
                          managerSubmission.submissionTime = $scope.workorder.timeApproved
                          $scope.displaySubmissions.push(
                              managerSubmission)
                      })
                      .catch((err) => console.log(err))
               }
               // Admin Sync
               if ($scope.workorder.timeSynced) {
                   ARS.getUser({id: $scope.workorder.syncedBy})
                      .then((admin) => {
                          thisUser = admin
                          const adminSubmission = ClassSubmission()
                          adminSubmission.type = 'Synced'
                          adminSubmission.firstname = thisUser.firstName
                          adminSubmission.lastname = thisUser.lastName
                          adminSubmission.submissionTime = $scope.workorder.timeSynced
                          $scope.displaySubmissions.push(adminSubmission)
                      })
                      .catch((err) => console.log(err))
               }
           })
           .catch((err) => console.log(err))
    }
    // ----------------------------------------------------

    // History Changes ------------------------------------
    // create the view for all edits
    $scope.displayChanges = []

    function ClassDisplayHistory () {
        return {
            panelName: '',
            itemName:  '',
            type:      '',
            before:    '',
            after:     '',
        }
    }

    // load all edits from the database
    _.map($scope.editHistories, (edit) => {
        // format the data correctly for presentation.
        if ($scope.workorder._id === edit.workOrder) {
            const thisEdit = ClassDisplayHistory()
            thisEdit.panelName = edit.path[0]
            thisEdit.itemName = edit.path.pop()
            thisEdit.type = edit.editType
            thisEdit.before = edit.before
            thisEdit.after = edit.after
            $scope.displayChanges.push(thisEdit)
        }
    })

    // load the username of the admin who made the edits. and get the
    // count
    if ($scope.editHistories.length !== 0) {
        ARS.getUser({id: $scope.editHistories.pop().user})
           .then((admin) => {
               $scope.editor = admin
           })
           .catch((err) => {
               console.log('Editor retrieval error')
               console.log(err)
           })
        $scope.editCount = $scope.editHistories.length + 1
    }

    // ----------------------------------------------------

    // Submit for approval or to Netsuite -----------------
    $scope.submit = () => {

        let allowSubmit = true
        console.log('Submitting...')

        /**
         * -----------------------------------------------------
         * ("manager") && (!managerApproved || !timeApproved)
         * && allowSubmit)
         *
         * To: WO->controllers.update( sec:1 )->managers.(UpdateToSync
         * || managerApprove)() which will either Sync or set as
         * manager approved depending on if the manager put any update
         * notes in.
         *
         * if () {
         */
        if (($cookies.get('role') === 'manager') &&
            (!$scope.workorder.managerApproved ||
                !$scope.workorder.timeApproved) && allowSubmit) {
            setSave($scope.workorder)
            console.log('manager && !approved')

            WorkOrders.update({id: $scope.workorder._id},
                $scope.workorder,
                () => {
                    AlertService.add('success',
                        'Successfully submitted for admin approval.')
                    $location.path('/myaccount')
                },
                (err) => {
                    console.log(err)
                    setDisplay($scope.workorder)
                    AlertService.add('danger',
                        'An error occurred while attempting to submit.')
                },
            )
            /**
             * -----------------------------------------------------
             * ("admin" && (!managerApproved && !timeApproved)
             * && allowSubmit)
             *
             * Admin's actions will approve the WO in this else if
             *
             * } else if() {
             */
        } else if ($cookies.get('role') === 'admin' &&
            (!$scope.workorder.managerApproved &&
                !$scope.workorder.timeApproved) && allowSubmit) {
            /**
             * -----------------------------------------------------
             * ("admin" && (!managerApproved && !timeApproved)
             * && allowSubmit)
             * (type !== 'Indirect')
             *
             * Since not Indirect
             *
             * To: WO->controllers.update( sec: 4 )
             * ->managers.UpdateToSync().updateDoc()
             *
             * which will either
             * approve the WO as the admin and Sync the WO.
             *
             * if() {
             */
            if ($scope.workorder.type !== 'Indirect') {
                console.log('admin && !approved && !indirect')
                AlertService.add('info',
                    'Will route to dashboard when netsuite returns ID. Otherwise a warning will show here.')
                $scope.workorder.netsuiteSyned = true
                setSave($scope.workorder)

                WorkOrders.update({id: $scope.workorder._id},
                    $scope.workorder,
                    (response) => {
                        if (response.netsuiteId !== '') {
                            AlertService.add('success',
                                'Successfully synced to netsuite.')
                            $location.path('/myaccount')
                        } else {
                            $scope.workorder.netsuiteSyned = false
                            $scope.workorder.timeSynced = null
                            $scope.workorder.syncedBy = ''
                            unSync($scope.workorder)
                            AlertService.add('danger',
                                'Not synced to Netsuite, no NSID in response.')
                        }
                    },
                    (err) => {
                        console.log(err)
                        console.log($scope.workorder)
                        $scope.workorder.netsuiteSyned = false
                        $scope.workorder.timeSynced = null
                        $scope.workorder.syncedBy = ''
                        unSync($scope.workorder)
                        AlertService.add('danger',
                            'An error occurred while attempting to sync.')
                    },
                )
                /**
                 * -----------------------------------------------------
                 * ("admin" && (!managerApproved && !timeApproved)
                 * && allowSubmit)
                 * (type === 'Indirect')
                 *
                 * Since Indirect
                 *
                 * To: WO->controllers.update( sec: 4 )
                 * ->managers.UpdateToSync().updateDoc()
                 *
                 * will set approved and set to sync Indirect but need
                 * to set netsuiteSyned so back end will do things
                 * correctly
                 *
                 * } else {
                 */
            } else {
                console.log('admin && !approved && indirect')
                $scope.workorder.netsuiteSyned = true
                setSave($scope.workorder)

                WorkOrders.update({id: $scope.workorder._id},
                    $scope.workorder,
                    (response) => {
                        AlertService.add('success',
                            'Successfully Submitted Indirect.')
                        $location.path('/myaccount')
                    },
                    (err) => {
                        console.log(err)
                        $scope.workorder.netsuiteSyned = false
                        $scope.workorder.timeSynced = null
                        $scope.workorder.syncedBy = ''
                        unSync($scope.workorder)
                        AlertService.add('danger',
                            'An error occurred while attempting to save work order.')
                    },
                )
            }
            /**
             * -----------------------------------------------------
             * ("admin" && managerApproved && allowSubmit)
             *
             * } else if () {
             */
        } else if ($cookies.get('role') === 'admin' &&
            $scope.workorder.managerApproved && allowSubmit) {
            /**
             * -----------------------------------------------------
             * ("admin" && managerApproved && allowSubmit)
             * (type !== 'Indirect')
             *
             * To: WO->controllers.update( sec: 5 )
             * ->managers.UpdateToSync().updateDoc()
             *
             * Approved. Set to sync by setting netsuiteSyned.
             * Since not Indirect this will sync to Netsuite
             *
             * if () {
             */
            if ($scope.workorder.type !== 'Indirect') {
                console.log('admin && approved && !indirect')
                AlertService.add('info',
                    'Will route to dashboard when netsuite returns ID. Otherwise a warning will show here.')
                $scope.workorder.netsuiteSyned = true
                setSave($scope.workorder)

                WorkOrders.update({id: $scope.workorder._id},
                    $scope.workorder,
                    (response) => {
                        if (response.netsuiteId !== '') {
                            AlertService.add('success',
                                'Successfully synced to netsuite.')
                            $location.path('/myaccount')
                        } else {
                            $scope.workorder.netsuiteSyned = false
                            $scope.workorder.timeSynced = null
                            $scope.workorder.syncedBy = ''
                            unSync($scope.workorder)
                            AlertService.add('danger',
                                'Not synced to Netsuite, no NSID in response.')
                        }
                    },
                    (err) => {
                        console.log(err)
                        $scope.workorder.netsuiteSyned = false
                        $scope.workorder.timeSynced = null
                        $scope.workorder.syncedBy = ''
                        unSync($scope.workorder)
                        console.log($scope.workorder)
                        AlertService.add('danger',
                            'An error occurred while attempting to sync.')
                    },
                )
                /**
                 * -----------------------------------------------------
                 * ("admin" && managerApproved && allowSubmit)
                 * (type === 'Indirect')
                 *
                 * To: WO->controllers.update( sec: 5 )
                 * ->managers.UpdateToSync().updateDoc()
                 *
                 *  Here everything is ready to be synced. But Indirect.
                 *  Let back end handle setting correct params.
                 *
                 * } else {
                 */
            } else {
                console.log('admin && approved && indirect')
                $scope.workorder.netsuiteSyned = true
                setSave($scope.workorder)

                WorkOrders.update({id: $scope.workorder._id},
                    $scope.workorder,
                    () => {
                        AlertService.add('success',
                            'Successfully saved Indirect work order, not synced to Netsuite.')
                        $location.path('/myaccount')
                    },
                    (err) => {
                        console.log(err)
                        $scope.workorder.netsuiteSyned = false
                        $scope.workorder.timeSynced = null
                        $scope.workorder.syncedBy = ''
                        unSync($scope.workorder)
                        AlertService.add('danger',
                            'An error occurred while attempting to save work order.')
                    },
                )
            }
        } else {
            AlertService.add('info',
                'Either not allowed to submit or no decision based on your authorization could be made.')
        }
    }
    // ----------------------------------------------------

    // Modals ---------------------------------------------
    $scope.openLeaseNotes = () => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLeaseNotesModal.html',
            controller:  'NotesModalCtrl',
            scope:       $scope,
            resolve:     {
                notes: function () {
                    return $scope.workorder.misc.leaseNotes
                },
            },
        })

        modalInstance.result.then((notes) => {
            $scope.workorder.misc.leaseNotes = notes
        })
    }

    $scope.openUnitNotes = () => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woUnitNotesModal.html',
            controller:  'NotesModalCtrl',
            scope:       $scope,
            resolve:     {
                notes: function () {
                    return $scope.workorder.misc.unitNotes
                },
            },
        })

        modalInstance.result.then((notes) => {
            $scope.workorder.misc.unitNotes = notes
        })
    }

    $scope.openUnitView = () => {
        if ($scope.displayUnit !== undefined) {
            const modalInstance = $uibModal.open({
                templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLocationModal.html',
                scope:       $scope,
                controller:  'woLocationModalCtrl',
            })
        } else {
            AlertService.add('danger',
                'No unit exists on this work order.')
        }
    }

    $scope.openJSA = () => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/review/modals/woJsaModal.html',
            controller:  'JsaReviewModalCtrl',
            windowClass: 'jsa-modal',
            resolve:     {
                jsa: function () {
                    return $scope.workorder.jsa
                },
            },
        })

        modalInstance.result.then((jsa) => {
            $scope.workorder.jsa = jsa
        })
    }
    // ----------------------------------------------------
    $scope.getUsedLaborCodes()
    $scope.getTimeElapsed()
    $scope.debounceSubmit = debounce($scope.submit, 10000, true)
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('WorkOrderReviewCtrl', ['$window',
        '$http', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies',
        'AlertService', 'TimeDisplayService', 'ApiRequestService', 'CommonWOfunctions',
        'WorkOrders', 'Units', 'Users', 'ReviewNotes', 'EditHistories', 'workorder',
        'reviewNotes', 'editHistories', 'me', 'applicationtypes', 'parts',
        'DateService', 'locations', 'Utils', 'woInputMatrixes', 'frameModels', 'engineModels', WorkOrderReviewCtrlFunc])
