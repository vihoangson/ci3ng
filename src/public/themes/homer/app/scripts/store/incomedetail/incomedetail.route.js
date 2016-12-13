(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("incomedetail", {
            url: "/incomedetail",
            templateUrl: "views/common/content-small.html",
            data: {
                pageTitle: "incomedetail"
            },
            abstract: true
        })
}

})();