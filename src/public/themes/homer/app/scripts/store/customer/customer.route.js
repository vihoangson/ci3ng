(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("customer", {
            url: "/customer",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("customer");
                    return $ocLazyLoad.load(["masonry", "ng-file-upload", "media", "income", "customer"]);
                }
            },
            data: {
                pageTitle: "customer"
            },
            abstract: true
        })
        .state("customer.management", {
            url: "/management",
            templateUrl: "views/store/customer/management.html",
            controller: "ManagementCustomerController as ctrl",
            data: {
                pageTitle: "Manage Customers",
                pageDesc: "From here you can browse all of the customer"
            }
        })
        .state("customer.detail", {
            url: "/detail/{id:int}",
            params: {id: null},
            templateUrl: "views/store/customer/detail.html",
            controller: "DetailCustomerController as ctrl",
            data: {
                pageTitle: "Detail Customer",
                pageDesc: "From here you can detail the Customer"
            }
        });
}

})();