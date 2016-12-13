(function(angular) {
angular
    .module("homer")
    .controller("ManagementExpenseController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function ManagementExpenseController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ManagementExpenseController.prototype = Object.create(AbstractController.prototype);
        ManagementExpenseController.prototype.constructor = ManagementExpenseController;

        ManagementExpenseController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.ExpensesVM = null;
            $scope.StartDate = null;
            $scope.EndDate = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var expensesvm = $injector.instantiate(ExpensesPageViewModel);
                expensesvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpensesVM = expensesvm;
                $scope.ExpensesVM.SetSearchParam("Type","");
                //set view model relation
                //int main view model
                $scope.ExpensesVM.InitData();
            };
            $scope.searchExpenses = function () {
                if($scope.StartDate!=null) {
                    $scope.ExpensesVM.SetSearchParam('GreaterOrEqualStartDate', parseJsonDateS($scope.StartDate));
                }else{
                    $scope.ExpensesVM.SetSearchParam('GreaterOrEqualStartDate', null);
                }
                if($scope.EndDate!=null) {
                    $scope.ExpensesVM.SetSearchParam('LessThanOrEqualEndDate', parseJsonDateS($scope.EndDate));
                }else{
                    $scope.ExpensesVM.SetSearchParam('LessThanOrEqualEndDate', null);
                }
                $scope.ExpensesVM.searchExpenses();
            };

            $scope.InitData();
        };

        return new ManagementExpenseController();
    }
})(angular);
