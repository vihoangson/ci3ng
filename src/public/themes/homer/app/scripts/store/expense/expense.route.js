(function() { "use strict";

chaos.config(configBlocks);

function configBlocks($stateProvider) {
    $stateProvider
        .state("expense", {
            url: "/expense",
            templateUrl: "views/common/content-small.html",
            resolve: {
                deps: function($ocLazyLoad, $translatePartialLoader) {
                    $translatePartialLoader.addPart("expense");
                    return $ocLazyLoad.load(["icheck", "ui-select", "category", "product", "expensedetail", "expense"]);
                }
            },
            data: {
                pageTitle: "expense"
            },
            abstract: true
        })
        .state("expense.management", {
            url: "/management",
            templateUrl: "views/store/expense/management.html",
            controller: "ManagementExpenseController as ctrl",
            data: {
                pageTitle: "Manage Expenses",
                pageDesc: "From here you can browse all of the expense"
            }
        })
        .state("expense.detail", {
            url: "/detail/{id:int}/{type:string}",
            params: {id: null, type: null},
            templateUrl: "views/store/expense/detail.html",
            controller: "DetailExpenseController as ctrl",
            data: {
                pageTitle: "Expense Detail",
                pageDesc: "From here you can detail the Expense"
            }
        })
        .state("expense.report", {
            url: "/report",
            templateUrl: "views/store/expense/report.html",
            controller: "ReportExpenseController as ctrl",
            data: {
                pageTitle: "Expense Report",
                pageDesc: "From here you can view all report of expenses"
            }
        });
}

})();