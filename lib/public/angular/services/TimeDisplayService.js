angular.module('CommonServices')
.factory('TimeDisplayService',[function(){

    var TimeDisplayService = {};
     // improved badding for more that 2 digits
      TimeDisplayService.pad = function (n) {
        if (n >= 0) {
          return n > 9 ? "" + n : "0" + n;
        } else {
          return n < -9 ? "" + n : "-0" + Math.abs(n);
        }
      }
      // Padder for more exact padding.
      TimeDisplayService.exactPad =  function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      };
      // Convert HH:-MM / -H:-M / -H:MM  to correct time intervals examples below
      TimeDisplayService.timeManager = function (h, m) {
        var HtoM = 0;
        var totalM = 0;
        // Initual Checks
        if ((m < 0) && (h === 0)) {    // IE: 0:-15  = -00:15 *
          return { hours: "-0" + h, minutes: TimeDisplayService.pad(Math.abs(m)) };
        } else if ((m < 0) && (h < 0)) {// IE: -4:-30 = -04:30 *
          return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(Math.abs(m)) };
        } else if ((m > 0) && (h === 0)) {
          return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(m) };
          // Recursive calls
        } else if ((m > 0) && (h < 0)) {// IE: -1:+30 = -00:30 *
          HtoM = Math.abs(Math.round(h * 60));
          totalM = m - HtoM;
          // Deal with negative times
          if (totalM > 0) { 
            h = ((totalM / 60) < 1) ? 0 : Math.round(totalM / 60);
          } else {
            h = parseInt(totalM / 60);
          }
          m = Math.round(totalM % 60);
          return TimeDisplayService.timeManager(h, m); // recursion
        } else if ((m < 0) && (h > 0)) {// IE: 1:-30 = 00:30 *
          HtoM = Math.abs(Math.round(h * 60));
          totalM = HtoM + m;
          h = ((totalM / 60) < 1) ? 0 : Math.floor(totalM / 60);
          m = Math.round(totalM % 60);
          return TimeDisplayService.timeManager(h, m); // recursion
        }
        return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(m) };
      };

    return TimeDisplayService;
}]);