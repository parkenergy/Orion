angular.module('MCDiligenceApp.Components').component('diligenceOverviewTable', {
    templateUrl: 'lib/public/angular/apps/mcdiligence/views/component-views/mcDiligenceOverviewTable.html',
    bindings:    {
        scrollContentSearch:  '&',
        contentSearch:        '&',
        mcUnitDiligenceForms: '<',
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
        }

        $onInit () {
            this.submit();
        }

        resort (by) {
            this.sortType = by;
            this.sortReverse = !this.sortReverse;
        }

        queryConstruct (limit, skip) {
            const query = {
                limit: limit,
                skip:  skip,
            };
            return query;
        }

        loadOnScroll () {
            console.log('Scrolling...');
            this.skip += this.limit;
            const query = this.queryConstruct(this.limit, this.skip);
            this.scrollContentSearch({query});
        }

        submit () {
            this.limit = 50;
            this.skip = 0;

            const query = this.queryConstruct(this.limit, this.skip);
            this.contentSearch({query});
        }

        routeToMCDiligenceForm (mcdf) {
            console.log('route');
            // this.$window.open('#/mcdiligence/view/' + mcdf._id);
        }
    }],
});
