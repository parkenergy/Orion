angular.module('CommonServices').factory('DateService', [function () {
    return {
        startOfDay (a) {
            const From = new Date(a);
            return new Date(From.setHours(0, 0, 0, 0));
        },

        endOfDay (b) {
            const To = new Date(b);
            return new Date(To.setHours(23, 59, 59, 999));
        },
        addHours (d, h) {
            if (typeof d === 'object') {
                return new Date(d.setTime(d.getTime() + (h * 60 * 60 * 1000)));
            } else if (typeof d === 'string') {
                return new Date(new Date(d).setTime(new Date(d).getTime() + (h * 60 * 60 * 1000)));
            } else {
                return new Date(d);
            }
        },

        /**
         * Need to save changes to Orion data as UTC time so when
         * queries run on the server(UTC time) they query the right
         * data.
         * @param date
         * @returns {Date}
         */
        saveToOrion (date) {
            const offset = date.getTimezoneOffset();
            return new Date(date.getTime() - (offset * 60 * 1000));
        },

        /**
         * Since time is saved to UTC on the server need to display
         * it in local time
         * @param date
         * @returns {Date}
         */
        displayLocal (date) {
            const offset = date.getTimezoneOffset();
            return new Date(date.getTime() + (offset * 60 * 1000));
        },

        /**
         * Date should be the new Date('from server string date')
         * that gets converted to local time which will be off.
         * Since the server will send back the right time but with the UTC
         * as GMT+0000 (UTC) we need to add the hour offset because a new date
         * will create the right time but with the hour offset. Now this will
         * convert it correctly.
         * @param {Date} date
         * @returns {Date}
         * @constructor
         */
        UTCtoLocaleDate (date) {
            if (typeof date === 'object') {
                return this.addHours(date.toUTCString(), new Date().getTimezoneOffset() / 60);
            } else if (typeof date === 'string') {
                return this.addHours(new Date(date).toUTCString(), new Date().getTimezoneOffset() /
                    60);
            } else {
                return date;
            }
        },

        /**
         * This method converts a date to what the server will read in utc time.
         * Since the server Time Zone offset is 0.
         * This method preserves the local time by sending it to the server which
         * then converts it to UTC time which will add the appropriate time.
         * @param {Date} date
         * @returns {Date}
         */
        dateToUTC (date) {
            return new Date(
                Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
                    date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
        },

        getToFromDatesWeek (num) {
            let returnStart;
            let returnEnd;
            const now = new Date();
            const toStart = new Date();
            const toEnd = new Date();
            const day = now.getDay();

            if (day > 0 && day < 6) {
                toStart.setDate(now.getDate() - day - 1);
            } else if (day === 6) {
                toStart.setDate(now.getDate());
            } else if (day === 7) {
                toStart.setDate(now.getDate() - 1);
            }

            returnStart = this.startOfDay(toStart);
            toEnd.setDate(now.getDate() + (num - day));
            returnEnd = this.endOfDay(toEnd);
            return {returnStart, returnEnd};
        },
    };
}]);
