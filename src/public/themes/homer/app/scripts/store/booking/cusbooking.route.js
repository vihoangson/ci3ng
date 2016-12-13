(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("cusbooking", {
            url: "/cusbooking",
            templateUrl: "views/common/content-empty.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("booking");
                    return $ocLazyLoad.load("booking");
                }
            },
            data: {
                allowGuest: true,
                pageTitle: "booking"
            },
            abstract: true
        })
        .state("cusbooking.register", {
            url: "/register",
            templateUrl: "views/store/booking/register.html",
            data: {
                pageTitle: "Booking « D'artistry Salon",
                specialClass: "blank"
            },
            controller: "RegisterBookingController as ctrl"
        });
}

})();