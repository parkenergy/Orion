function ApiRequestService ($q, $http, Units, Users, Customers, ReviewNotes, Locations, CallReports, PartOrders, Parts, EngineModels, FrameModels, WorkOrders, WoUnitInputMatrixes, WOPMCheck,
    PaidTimeOffs, States, Counties, AssetTypes, ApplicationTypes, MCUnitDiligenceForms) {
    const ARS = {}
    ARS.http = {
        get:  {},
        post: {},
    }

    // CallReports -----------------------------------
    ARS.CallReports = (obj) => CallReports.query(obj).$promise
    // -----------------------------------------------

    // Counties --------------------------------------
    ARS.Counties = (obj) => Counties.query(obj).$promise
    // -----------------------------------------------

    // States ----------------------------------------
    ARS.States = (obj) => States.query(obj).$promise
    // -----------------------------------------------

    // Customers -------------------------------------
    ARS.Customers = (obj) => Customers.query(obj).$promise
    // -----------------------------------------------

    // PaidTimeOffs ------------------------------------
    ARS.PaidTimeOffs = (obj) => PaidTimeOffs.query(obj).$promise
    // -----------------------------------------------

    // PartOrders ------------------------------------
    ARS.PartOrders = (obj) => PartOrders.query(obj).$promise
    // -----------------------------------------------

    // ReviewNotes -----------------------------------
    ARS.ReviewNotes = (obj) => ReviewNotes.query(obj).$promise
    // -----------------------------------------------

    // Units -----------------------------------------
    ARS.Units = (obj) => Units.query(obj).$promise
    // -----------------------------------------------

    // WoInputMatrixes -------------------------------
    ARS.WoUnitInputMatrixes = (obj) => WoUnitInputMatrixes.query(obj).$promise
    // -----------------------------------------------

    // WOSOPChecks -----------------------------------
    ARS.WOPMCheck = (obj) => WOPMCheck.query(obj).$promise
    // -----------------------------------------------

    // Engine Models ---------------------------------
    ARS.EngineModels = (obj) => EngineModels.query(obj).$promise
    // -----------------------------------------------

    // Frame Models ----------------------------------
    ARS.FrameModels = (obj) => FrameModels.query(obj).$promise
    // -----------------------------------------------

    // Parts -----------------------------------------
    ARS.Parts = (obj) => Parts.query(obj).$promise
    // -----------------------------------------------

    // Asset Types -----------------------------------
    ARS.AssetTypes = (obj) => AssetTypes.query(obj).$promise
    // -----------------------------------------------

    // Application Types -----------------------------
    ARS.ApplicationTypes = (obj) => ApplicationTypes.query(obj).$promise
    // -----------------------------------------------

    // Locations -------------------------------------
    ARS.Locations = (obj) => Locations.query(obj).$promise
    // -----------------------------------------------

    // Users -----------------------------------------
    ARS.Users = (obj) => Users.query(obj).$promise
    // getUser usage: send {id: 'ABC001'}
    ARS.getUser = (obj) => Users.get(obj).$promise
    // -----------------------------------------------

    // WorkOrders ------------------------------------
    ARS.WorkOrders = (obj) => WorkOrders.query(obj).$promise
    // -----------------------------------------------

    // MCUnitDiligenceForms --------------------------
    ARS.MCUnitDiligenceForms = (obj) => MCUnitDiligenceForms.query(obj).$promise
    // -----------------------------------------------

    // HTTP Create WorkOrder -------------------------
    ARS.http.post.Workorder = (obj) => $http({
        url:    '/api/WorkOrders',
        method: 'POST',
        params: obj,
    })
    // -----------------------------------------------

    // HTTP Admin Create WorkOrder -------------------
    ARS.http.post.AdminWorkorder = (obj) => $http.post('/api/WorkOrdersAdminCreate', obj)
    // -----------------------------------------------

    // HTTP Unit WorkOrders --------------------------
    ARS.http.get.UnitWorkOrders = (obj) => $http({
        url:    '/api/Unit/Workorders',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP MCUnitDiligenceForms Count ----------------
    ARS.http.get.MCUnitDiligenceFormCount = (obj) => $http({
        url:    '/api/MCUnitDiligenceFormsNoIdentityCount',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP WorkOrders Count --------------------------
    ARS.http.get.WorkOrderCount = (obj) => $http({
        url:    '/api/workorderscount',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP no Auth WorkOrders Count ------------------
    ARS.http.get.WorkOrdersNoIdentityCount = (obj) => $http({
        url:    '/api/workordersnoidentitycount',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP unapproved by area WorkOrders -------------
    ARS.http.get.WorkOrdersUnapprovedArea = (obj) => $http({
        url:    '/api/workordersunapprovedarea',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP unapproved by user WorkOrders -------------
    ARS.http.get.WorkOrdersUnapprovedByUser = (obj) => $http({
        url:    '/api/workordersunapprovedbyuser',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP no Auth Unit Count ------------------------
    ARS.http.get.UnitsNoIdentityCount = (obj) => $http({
        url:    '/api/unitnoidentitycount',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP for counties ------------------------------
    ARS.http.get.countiesSplit = (obj) => $http({
        url:    '/api/counties',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    // HTTP for County --------------------------------
    ARS.http.get.county = (id) => $http({
        url: `/api/counties/${id}`,
        method: 'GET',
    })
    // ------------------------------------------------

    // HTTP for State ---------------------------------
    ARS.http.get.state = (id) => $http({
        url: `/api/states/${id}`,
        method: 'GET',
    })
    // ------------------------------------------------

    // HTTP for Locations -----------------------------
    ARS.http.get.locations = (obj) => $http({
        url:    '/api/locations',
        method: 'GET',
        params: obj,
    })
    // ------------------------------------------------

    return ARS
}

angular.module('CommonServices')
       .factory('ApiRequestService', [
           '$q',
           '$http',
           'Units',
           'Users',
           'Customers',
           'Locations',
           'ReviewNotes',
           'CallReports',
           'PartOrders',
           'Parts',
           'EngineModels',
           'FrameModels',
           'WorkOrders',
           'WoUnitInputMatrixes',
           'WOPMCheck',
           'PaidTimeOffs',
           'States',
           'Counties',
           'AssetTypes',
           'ApplicationTypes',
           'MCUnitDiligenceForms', ApiRequestService])
