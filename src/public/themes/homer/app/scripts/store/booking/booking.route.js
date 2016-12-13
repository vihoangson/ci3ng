(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("booking", {
            url: "/booking",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("booking");
                    return $ocLazyLoad.load(["ui-select", "customer", "booking"]);
                }
            },
            data: {
                pageTitle: "booking"
            },
            abstract: true
        })
        .state("booking.management", {
            url: "/management",
            templateUrl: "views/store/booking/management.html",
            controller: "ManagementBookingController as ctrl",
            data: {
                pageTitle: "Manage Bookings",
                pageDesc: "From here you can browse all of the booking"
            }
        });
}

})();