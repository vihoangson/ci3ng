(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("income", {
            url: "/income",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("income");
                    return $ocLazyLoad.load(["icheck", "ui-select", "category", "customer", "product", "promotion",
                        "incomepromotion", "incomedetail", "income"]);
                }
            },
            data: {
                pageTitle: "income"
            },
            abstract: true
        })
        .state("income.management", {
            url: "/management",
            templateUrl: "views/store/income/management.html",
            controller: "ManagementIncomeController as ctrl",
            data: {
                pageTitle: "Manage Incomes",
                pageDesc: "From here you can browse all of the income "
            }
        })
        .state("income.detail", {
            url: "/detail/{id:int}/{productName:string}/{hairWalkIn:string}",
            params: {id: null, productName: null, hairWalkIn: null},
            templateUrl: "views/store/income/detail.html",
            controller: "DetailIncomeController as ctrl",
            data: {
                pageTitle: "Income Detail",
                pageDesc: "From here you can detail the Income"
            }
        })
        .state("income.report", {
            url: "/report",
            templateUrl: "views/store/income/report.html",
            controller: "ReportIncomeController as ctrl",
            data: {
                pageTitle: "Income Report",
                pageDesc: "From here you can view all of the income report"
            }
        });
}

})();