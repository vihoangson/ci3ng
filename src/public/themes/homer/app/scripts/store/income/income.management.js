(function(angular) {
angular
    .module("homer")
    .controller("ManagementIncomeController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function ManagementIncomeController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ManagementIncomeController.prototype = Object.create(AbstractController.prototype);
        ManagementIncomeController.prototype.constructor = ManagementIncomeController;

        ManagementIncomeController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.IncomesVM = null;
            $scope.CustomersVM = null;
            $scope.StartDate =null;
            $scope.EndDate = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var incomesvm = $injector.instantiate(IncomesPageViewModel);
                incomesvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomesVM = incomesvm;

                var customersvm = $injector.instantiate(CustomersViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;
                $scope.CustomersVM.InitData();
                //set view model relation
                //int main view model

                $scope.IncomesVM.InitData();
            };
            $scope.searchIncomes = function () {
                if($scope.StartDate!=null) {
                    $scope.IncomesVM.SetSearchParam('GreaterOrEqualStartDate', parseJsonDateS($scope.StartDate));
                }else{
                    $scope.IncomesVM.SetSearchParam('GreaterOrEqualStartDate', null);
                }
                if($scope.EndDate!=null) {
                    $scope.IncomesVM.SetSearchParam('LessThanOrEqualEndDate', parseJsonDateS($scope.EndDate));
                }else{
                    $scope.IncomesVM.SetSearchParam('LessThanOrEqualEndDate', null);
                }

                $scope.IncomesVM.searchIncomes();
            };

            $scope.InitData();
        };

        return new ManagementIncomeController();
    }
})(angular);
