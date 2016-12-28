(function() { "use strict";
/**
 * @author ntd1712
 */
chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("blog", {
            url: "/blog",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("blog");
                    return $ocLazyLoad.load("blog");
                }
            },
            data: {
                pageTitle: "Blog"
            },
            controller: "BlogController as ctrl",
            abstract: true
        })
        .state("blog.index", {
            url: "",
            templateUrl: "views/common/simple-grid.html",
            data: {
                pageTitle: "MANAGE_STAFFS",
                pageDesc: "FROM_HERE_YOU_CAN_BROWSE_ALL_OF_THE_LATEST_RECORDS"
            }
        })
        .state("blog.create", {
            url: "/create",
            views: {
                "": {
                    templateUrl: "views/common/simple-form.html"
                },
                "@blog.create": {
                    templateUrl: "views/kintai/blog/form.html"
                }
            },
            data: {
                pageTitle: "NEW_STAFF",
                pageDesc: "FROM_HERE_YOU_CAN_CREATE_A_NEW_RECORD",
                isNew: true
            }
        })
        .state("blog.edit", {
            url: "/edit/{id:int}",
            views: {
                "": {
                    templateUrl: "views/common/simple-form.html"
                },
                "@blog.edit": {
                    templateUrl: "views/kintai/blog/form.html"
                }
            },
            data: {
                pageTitle: "EDIT_STAFF",
                pageDesc: "FROM_HERE_YOU_CAN_EDIT_AN_EXISTING_RECORD",
                isNew: false
            }
        });
}

})();