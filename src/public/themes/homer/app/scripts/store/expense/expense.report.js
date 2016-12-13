(function(angular) {
angular
    .module("homer")
    .controller("ReportExpenseController", Anonymous);
    function Anonymous($scope, $injector,$filter,$http, AbstractController) {
        function ReportExpenseController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ReportExpenseController.prototype = Object.create(AbstractController.prototype);
        ReportExpenseController.prototype.constructor = ReportExpenseController;

        ReportExpenseController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.ExpenseDetailsVM = null;
            $scope.StartDate = null;
            $scope.EndDate = null;
            $scope.ForDate = null;
            $scope.CategorysVM = null;
            $scope.ProductsVM = null;
            $scope.IsExportPdf = false;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);
                
                var categorysvm = $injector.instantiate(CategorysViewModel);
                categorysvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CategorysVM = categorysvm;
                $scope.CategorysVM.InitData();

                var productsvm = $injector.instantiate(ProductsViewModel);
                productsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ProductsVM = productsvm;
                $scope.ProductsVM.InitData();

                var expensedetailsvm = $injector.instantiate(ExpenseDetailsPageViewModel);
                expensedetailsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpenseDetailsVM = expensedetailsvm;
                //set view model relation
                $scope.ExpenseDetailsVM.GetSearchParam('Expense.Type').Value = "";
            };
            $scope.onChangeForDate = function() {
                if($scope.ForDate!=null) {
                    $scope.StartDate =null;
                    $scope.EndDate = null;
                }
            };
            $scope.searchExpenseDetails = function () {
                if($scope.ForDate!=null) {
                    $scope.StartDate = $scope.ForDate;
                    $scope.EndDate = $scope.ForDate;
                }
                if($scope.StartDate!=null) {
                    $scope.ExpenseDetailsVM.SetSearchParam('GreaterOrEqualStartDate', parseJsonDateS($scope.StartDate));
                }else{
                    $scope.ExpenseDetailsVM.SetSearchParam('GreaterOrEqualStartDate', null);
                }
                if($scope.EndDate!=null) {
                    $scope.ExpenseDetailsVM.SetSearchParam('LessThanOrEqualEndDate', parseJsonDateS($scope.EndDate));
                }else{
                    $scope.ExpenseDetailsVM.SetSearchParam('LessThanOrEqualEndDate', null);
                }

                $scope.ExpenseDetailsVM.searchExpenseDetails();
            };
            $scope.exportPdfExpenseDetails = function() {
                $scope.IsExportPdf = true;
                $scope.ExpenseDetailsVM.SetFFInit(function(){
                    if($scope.IsExportPdf == true){
                        $scope.ExpenseDetailsVM.GetUrl.getExpenseDetails =  $http.defaults.route +"expensedetail/getpage";
                    }
                    $scope.IsExportPdf = false;
                });
                $scope.ExpenseDetailsVM.GetUrl.getExpenseDetails =  $http.defaults.route +"expensedetail/getpage?export=pdf";
                $scope.searchExpenseDetails();
            }
            $scope.onChangeSelectType = function() {
                $scope.ExpenseDetailsVM.GetSearchParam('Expense.Description').Value = "";
                $scope.ExpenseDetailsVM.GetSearchParam('ProductId').Value = "";
                $scope.ExpenseDetailsVM.GetSearchParam('Product.CategoryId').Value = "";
                $scope.ExpenseDetailsVM.GetSearchParam('MinPrice').Value = "";
                $scope.ExpenseDetailsVM.GetSearchParam('MaxPrice').Value = "";
                $scope.ExpenseDetailsVM.GetSearchParam('StartDate').Value = "";
                $scope.ExpenseDetailsVM.GetSearchParam('EndDate').Value = "";
                $scope.ExpenseDetailsVM.GetSearchParam('ForDate').Value = "";
            }
            $scope.InitData();
        };

        return new ReportExpenseController();
    }
})(angular);
