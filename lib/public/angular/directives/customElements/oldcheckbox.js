/**
 *            oldcheckbox
 *
 * Created by marcusjwhelan on 11/15/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonDirectives')
.directive('oldCheckBox', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/customElements/oldcheckbox.html',
    scope: {
      labelText: '@',
      data: '=',
      disabled: '='
    }
  };
}]);
