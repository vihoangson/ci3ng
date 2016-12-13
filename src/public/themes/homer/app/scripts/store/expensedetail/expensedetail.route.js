(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("expensedetail", {
            url: "/expensedetail",
            templateUrl: "views/common/content-small.html",
            data: {
                pageTitle: "expensedetail"
            },
            abstract: true
        })
}

})();