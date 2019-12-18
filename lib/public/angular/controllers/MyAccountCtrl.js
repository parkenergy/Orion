function MyAccountCtrl(
    $window,
    $scope,
    users,
    units,
    ApiRequestService,
    SessionService
) {
    // Variables ------------------------------------------
    const ARS = ApiRequestService; // local
    const SS = SessionService; // local
    const searchUsers = []; // local
    const searchedAreas = []; // local
    const resData = []; // local
    $scope.units = units; // to PmDash
    $scope.users = users; // to PmDash
    $scope.areas = []; // to PmDash
    // ----------------------------------------------------

    $window.onhashchange = () => SS.drop("unitNumber");

    // lookup unapproved work orders count ----------------
    // get non admins
    const Area = () => ({ area: "", count: 0 });
    const updateArea = () => {
        searchedAreas.forEach(name => {
            const thisArea = Area();
            thisArea.area = name;
            resData.forEach(a => {
                if (a.area === name) {
                    thisArea.count += a.count;
                }
            });
            $scope.areas.push(thisArea);
        });
    };
    $scope.users.forEach(user => {
        if (user.role !== "admin") {
            let newUser = { username: user.username, area: user.area };
            searchUsers.push(newUser);
        }
    });

    const obj = { users: searchUsers };
    ARS.http.get.WorkOrdersUnapprovedArea(obj).then(
        res => {
            res.data.forEach(a => {
                const thisArea = Area();
                thisArea.area = a.area
                    .split(":")[0]
                    .slice(2)
                    .trim();
                thisArea.count = a.count;
                if (
                    searchedAreas.indexOf(thisArea.area) === -1 &&
                    thisArea.area !== ""
                ) {
                    searchedAreas.push(thisArea.area);
                }
                resData.push(thisArea);
            });
            updateArea();
        },
        err => {
            console.log(`Error retrieving unapproved by area: ${err}`);
        }
    );
    // ----------------------------------------------------
}
angular
    .module("CommonControllers")
    .controller("MyAccountCtrl", [
        "$window",
        "$scope",
        "users",
        "units",
        "ApiRequestService",
        "SessionService",
        MyAccountCtrl
    ]);
