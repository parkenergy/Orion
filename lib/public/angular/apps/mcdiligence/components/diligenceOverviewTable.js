angular.module('MCDiligenceApp.Components').component('diligenceOverviewTable', {
    templateUrl: 'lib/public/angular/apps/mcdiligence/views/component-views/mcDiligenceOverviewTable.html',
    bindings:    {
        mcUnitDiligenceReport:    '&',
        contentSearch:            '&',
        mcUnitDiligenceFormCount: '<',
        reportDisabled:           '<',
        mcUnitDiligenceForms:     '<',
    },
    controller:  ['$window', 'DateService', class MCDiligenceOverviewCtrl {
        constructor ($window, DateService) {
            this.DS = DateService;
            this.$window = $window;
            this.sortType = 'epoch';
            this.sortReverse = false;
            this.searchFilter = '';

            this.limit = 50;
            this.skip = 0;
            this.dates = {
                from:      null,
                to:        null,
                fromInput: null,
                toInput:   null,
            };
        }

        $onInit () {
            this.submit();
        }

        startOfDay (input) {
            this.dates.fromInput = input;
            if (typeof input === 'object' && input !== null) {
                this.dates.from = new Date(new Date(input).setHours(0, 0, 0, 0));
            }
            if (input === null) {
                this.dates.from = null;
            }
        };

        endOfDay (input) {
            this.dates.toInput = input;
            if (typeof input === 'object' && input !== null) {
                this.dates.to = new Date(new Date(input).setHours(23, 59, 59, 999));
            }
            if (input === null) {
                this.dates.to = null;
            }
        };

        resort (by) {
            this.sortType = by;
            this.sortReverse = !this.sortReverse;
        }

        queryConstruct (limit, skip) {
            const query = {
                limit: limit,
                skip:  skip,
            };
            if (this.dates.from && this.dates.to) {
                query.from = this.DS.saveToOrion(this.dates.from);
                query.to = this.DS.saveToOrion(this.dates.to);
            }
            return query;
        }

        submit () {
            this.limit = 50;
            this.skip = 0;

            const query = this.queryConstruct(this.limit, this.skip);
            this.contentSearch({query});
        }

        report (type) {
            const query = {};
            if (this.dates.from && this.dates.to) {
                query.from = this.DS.saveToOrion(this.dates.from);
                query.to = this.DS.saveToOrion(this.dates.to);
            }
            if (type === 'mcUnitDownload') {
                this.mcUnitDiligenceReport({query});
            }
        }

        routeToMCDiligenceForm (mcdf) {
            console.log('route');
            this.$window.open('#/mcdiligence/view/' + mcdf._id);
        }
    }],
});
