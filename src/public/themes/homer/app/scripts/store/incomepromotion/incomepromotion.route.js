(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("incomepromotion", {
            url: "/incomepromotion",
            templateUrl: "views/common/content-small.html",
            data: {
                pageTitle: "incomepromotion"
            },
            abstract: true
        });
}

})();