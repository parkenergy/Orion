angular.module('CommonControllers').controller('AreaPMReportCtrl', [
    '$scope',
    'users',
    'units',
    'areaName',
    'ApiRequestService',
    function ($scope, users, units, areaName, ApiRequestService) {

        const ARS = ApiRequestService;
        const searchedUsers = [];
        $scope.users = users;
        $scope.units = units;
        $scope.areaName = areaName;

        $scope.users.forEach((user) => {
            if (user.role !== 'admin') {
                searchedUsers.push(user);
            }
        });

        const obj = {users: JSON.stringify(searchedUsers)};
        ARS.http.get.WorkOrdersUnapprovedByUser(obj)
            .then((res) => {
                res.data.forEach((unapprovedObj) => {
                    $scope.users.forEach((user) => {
                        if (user.username === unapprovedObj.user) {
                            user.unapprovedCount = unapprovedObj.count;
                        }
                    });
                });
            }, (err) => {
                console.log(`Error retrieving unapproved for user: ${err}`);
            });
}]);
