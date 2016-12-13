(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("media", {
            url: "/media",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("media");
                    return $ocLazyLoad.load(["customer", "media"]);
                }
            },
            data: {
                pageTitle: "media"
            },
            abstract: true
        })
        .state("media.admin", {
            url: "/admin",
            templateUrl: "views/store/media/admin.html",
            controller: "AdminMediaController as ctrl",
            data: {
                pageTitle: "Manage Medias",
                pageDesc: "From here you can browse all of the media"
            }
        })
    ;
}

})();