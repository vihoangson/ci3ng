(function(angular) {
angular
    .module("homer")
    .controller("AdminExpenseDetailController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function AdminExpenseDetailController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        AdminExpenseDetailController.prototype = Object.create(AbstractController.prototype);
        AdminExpenseDetailController.prototype.constructor = AdminExpenseDetailController;

        AdminExpenseDetailController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.ExpenseDetailsVM = null;
            $scope.ExpenseDetailVM = null;
            $scope.ExpensesVM = null;
            $scope.ProductsVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var expensedetailsvm = $injector.instantiate(ExpenseDetailsPageViewModel);
                expensedetailsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpenseDetailsVM = expensedetailsvm;

                var expensedetailvm = $injector.instantiate(ExpenseDetailViewModel);
                expensedetailvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpenseDetailVM = expensedetailvm;

                var expensesvm = $injector.instantiate(ExpensesViewModel);
                expensesvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpensesVM = expensesvm;
                $scope.ExpensesVM.InitData();
                var productsvm = $injector.instantiate(ProductsViewModel);
                productsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ProductsVM = productsvm;
                $scope.ProductsVM.InitData();
                //set view model relation
                //int main view model

                $scope.ExpenseDetailsVM.InitData();
            };
            $scope.removeExpenseDetail = function (item) {
                $scope.ExpenseDetailsVM.removeExpenseDetail(item);
            };
            $scope.checkValExpenseDetail = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValExpenseDetail(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValExpenseDetail(valfield.Name, item);
                    });
                }
            }
            function ValExpenseDetail(fieldname, item) {
                switch (fieldname) {
                }
            }
            $scope.checkEditingExpenseDetail = function () {
                var isedit = false;
                angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingExpenseDetail()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupExpenseDetail = function (item) {
                $scope.ExpenseDetailVM.ExpenseDetail = null;
                $scope.ExpenseDetailVM.SetId(0);

                $scope.ExpenseDetailVM.SetFFInit(function() {
                    $('#popupExpenseDetail').on('hide.bs.modal', function () {
                        if ($scope.ExpenseDetailVM.ExpenseDetail.isedit == true) {
                            $scope.ExpenseDetailVM.ExpenseDetail.isedit = false;
                            $scope.ExpenseDetailVM.cancelEditExpenseDetail($scope.ExpenseDetailVM.ExpenseDetail);
                        }
                    });
                    $("#popupExpenseDetail").modal("show");
                });
                $scope.ExpenseDetailVM.InitData();
            };
            $scope.startEditPopupExpenseDetail = function (item) {
                $scope.ExpenseDetailVM.ExpenseDetail = item;
                $scope.ExpenseDetailVM.startEditExpenseDetail($scope.ExpenseDetailVM.ExpenseDetail);
                $('#popupExpenseDetail').on('hide.bs.modal', function () {
                    if ($scope.ExpenseDetailVM.ExpenseDetail.isedit == true) {
                        $scope.ExpenseDetailVM.cancelEditExpenseDetail($scope.ExpenseDetailVM.ExpenseDetail);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupExpenseDetail").modal("show");
            };
            $scope.finishEditPopupExpenseDetail = function () {
                $scope.checkValExpenseDetail("All", $scope.ExpenseDetailVM.ExpenseDetail);
                if ($scope.ExpenseDetailVM.ExpenseDetail.valmanager.IsValid) {
                    $scope.ExpenseDetailVM.SetFFSave(function () {
                        var item = $filter('filter')($scope.ExpenseDetailsVM.ArrExpenseDetail, { Id: $scope.ExpenseDetailVM.ExpenseDetail.Id })[0];
                        if(item==null){
                            $scope.ExpenseDetailsVM.ArrExpenseDetail.push($scope.ExpenseDetailVM.ExpenseDetail);
                            $scope.ExpenseDetailsVM.Paging.TotalItems +=1;
                        }
                        $("#popupExpenseDetail").modal("hide");
                    });
                    $scope.ExpenseDetailVM.finishEditExpenseDetail($scope.ExpenseDetailVM.ExpenseDetail);
                } else {
                    $('.validateinput:first').focus();
                }
            };
            
            
            $scope.InitData();
        };

        return new AdminExpenseDetailController();
    }
})(angular);
