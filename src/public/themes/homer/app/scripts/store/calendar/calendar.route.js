(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("calendar", {
            url: "/calendar",
            views: {
                "": {
                    templateUrl: "views/common/content-small.html"
                },
                "@calendar": {
                    templateUrl: "views/store/calendar/list.html",
                    controller: "CalendarController as ctrl"
                }
            },
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("calendar");
                    return $ocLazyLoad.load(["ui-select", "booking", "customer", "calendar"]);
                }
            },
            data: {
                pageTitle: "CALENDAR",
                pageDesc: "FROM_HERE_YOU_CAN_BROWSE_ALL_OF_THE_LATEST_EVENTS"
            }
        });
}

})();