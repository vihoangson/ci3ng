(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("category", {
            url: "/category",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("category");
                    return $ocLazyLoad.load("category");
                }
            },
            data: {
                pageTitle: "category"
            },
            abstract: true
        })
        .state("category.management", {
            url: "/management",
            templateUrl: "views/store/category/management.html",
            controller: "ManagementCategoryController as ctrl",
            data: {
                pageTitle: "Manage Categories",
                pageDesc: "From here you can browse all of the category"
            }
        });
}

})();