(function(angular) {
angular
    .module("homer")
    .controller("ReportIncomeController", Anonymous);
    function Anonymous($scope, $injector,$filter,$http, AbstractController) {
        function ReportIncomeController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ReportIncomeController.prototype = Object.create(AbstractController.prototype);
        ReportIncomeController.prototype.constructor = ReportIncomeController;

        ReportIncomeController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.IncomeDetailsVM = null;
            $scope.CustomersVM = null;
            $scope.CategorysVM = null;
            $scope.StartDate =null;
            $scope.EndDate = null;
            $scope.ForDate = null;
            $scope.IsExportPdf = false;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var incomedetailsvm = $injector.instantiate(IncomeDetailsPageViewModel);
                incomedetailsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomeDetailsVM = incomedetailsvm;

                var customersvm = $injector.instantiate(CustomersViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;
                $scope.CustomersVM.InitData();

                var categorysvm = $injector.instantiate(CategorysViewModel);
                categorysvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CategorysVM = categorysvm;
                $scope.CategorysVM.InitData();
                
                var productsvm = $injector.instantiate(ProductsViewModel);
                productsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ProductsVM = productsvm;
                $scope.ProductsVM.InitData();
                //set view model relation
                //int main view model

            };
            $scope.onChangeForDate = function() {
                if($scope.ForDate!=null) {
                    $scope.StartDate =null;
                    $scope.EndDate = null;
                }
            };
            $scope.searchIncomeDetails = function () {
                if($scope.ForDate!=null) {
                    $scope.StartDate = $scope.ForDate;
                    $scope.EndDate = $scope.ForDate;
                }
                if($scope.StartDate!=null) {
                    $scope.IncomeDetailsVM.SetSearchParam('GreaterOrEqualStartDate', parseJsonDateS($scope.StartDate));
                }else{
                    $scope.IncomeDetailsVM.SetSearchParam('GreaterOrEqualStartDate', null);
                }
                if($scope.EndDate!=null) {
                    $scope.IncomeDetailsVM.SetSearchParam('LessThanOrEqualEndDate', parseJsonDateS($scope.EndDate));
                }else{
                    $scope.IncomeDetailsVM.SetSearchParam('LessThanOrEqualEndDate', null);
                }

                $scope.IncomeDetailsVM.searchIncomeDetails();
            };
            $scope.exportPdfIncomeDetails = function() {
                $scope.IsExportPdf = true;
                $scope.IncomeDetailsVM.SetFFInit(function(){
                    if($scope.IsExportPdf == true){
                        $scope.IncomeDetailsVM.GetUrl.getIncomeDetails =  $http.defaults.route +"incomedetail/getpage";
                    }
                    $scope.IsExportPdf = false;
                });
                $scope.IncomeDetailsVM.GetUrl.getIncomeDetails =  $http.defaults.route +"incomedetail/getpage?export=pdf";
                $scope.IncomeDetailsVM.searchIncomeDetails();
            };
            $scope.InitData();
        };

        return new ReportIncomeController();
    }
})(angular);
