(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("product", {
            url: "/product",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("product");
                    return $ocLazyLoad.load(["category", "product"]);
                }
            },
            data: {
                pageTitle: "product"
            },
            abstract: true
        })
        .state("product.management", {
            url: "/management",
            templateUrl: "views/store/product/management.html",
            controller: "ManagementProductController as ctrl",
            data: {
                pageTitle: "Manage Products",
                pageDesc: "From here you can browse all of the product"
            }
        });
}

})();