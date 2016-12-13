(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("promotion", {
            url: "/promotion",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("promotion");
                    return $ocLazyLoad.load("promotion");
                }
            },
            data: {
                pageTitle: "promotion"
            },
            abstract: true
        })
        .state("promotion.management", {
            url: "/management",
            templateUrl: "views/store/promotion/management.html",
            controller: "ManagementPromotionController as ctrl",
            data: {
                pageTitle: "Manage Promotions",
                pageDesc: "From here you can browse all of the promotion"
            }
        })
    ;
}

})();