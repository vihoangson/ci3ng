(function(angular) {
angular
    .module("homer")
    .controller("AdminExpenseController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function AdminExpenseController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        AdminExpenseController.prototype = Object.create(AbstractController.prototype);
        AdminExpenseController.prototype.constructor = AdminExpenseController;

        AdminExpenseController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.ExpensesVM = null;
            $scope.ExpenseVM = null;
            $scope.CustomersVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var expensesvm = $injector.instantiate(ExpensesPageViewModel);
                expensesvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpensesVM = expensesvm;

                var expensevm = $injector.instantiate(ExpenseViewModel);
                expensevm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpenseVM = expensevm;

                var customersvm = $injector.instantiate(CustomersViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;
                $scope.CustomersVM.InitData();
                //set view model relation
                //int main view model

                $scope.ExpensesVM.InitData();
            };
            $scope.removeExpense = function (item) {
                $scope.ExpensesVM.removeExpense(item);
            };
            $scope.checkValExpense = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValExpense(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValExpense(valfield.Name, item);
                    });
                }
            }
            function ValExpense(fieldname, item) {
                switch (fieldname) {
                case "CustomerId":
                    if (item.CustomerId == "" || item.CustomerId == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                }
            }
            $scope.onChangeExpense_CustomerId = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValExpense("CustomerId", item);
                }
            };
            $scope.checkEditingExpense = function () {
                var isedit = false;
                angular.forEach($scope.ExpensesVM.ArrExpense, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingExpense()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupExpense = function (item) {
                $scope.ExpenseVM.Expense = null;
                $scope.ExpenseVM.SetId(0);

                $scope.ExpenseVM.SetFFInit(function() {
                    $('#popupExpense').on('hide.bs.modal', function () {
                        if ($scope.ExpenseVM.Expense.isedit == true) {
                            $scope.ExpenseVM.Expense.isedit = false;
                            $scope.ExpenseVM.cancelEditExpense($scope.ExpenseVM.Expense);
                        }
                    });
                    $("#popupExpense").modal("show");
                });
                $scope.ExpenseVM.InitData();
            };
            $scope.startEditPopupExpense = function (item) {
                $scope.ExpenseVM.Expense = item;
                $scope.ExpenseVM.startEditExpense($scope.ExpenseVM.Expense);
                $('#popupExpense').on('hide.bs.modal', function () {
                    if ($scope.ExpenseVM.Expense.isedit == true) {
                        $scope.ExpenseVM.cancelEditExpense($scope.ExpenseVM.Expense);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupExpense").modal("show");
            };
            $scope.finishEditPopupExpense = function () {
                $scope.checkValExpense("All", $scope.ExpenseVM.Expense);
                if ($scope.ExpenseVM.Expense.valmanager.IsValid) {
                    $scope.ExpenseVM.SetFFSave(function () {
                          $scope.ExpenseVM.Expense.InvoiceDateF = parseDateDisplay($scope.ExpenseVM.Expense.InvoiceDate);
                          $scope.ExpenseVM.Expense.DueDateF = parseDateDisplay($scope.ExpenseVM.Expense.DueDate);
                        var item = $filter('filter')($scope.ExpensesVM.ArrExpense, { Id: $scope.ExpenseVM.Expense.Id })[0];
                        if(item==null){
                            $scope.ExpensesVM.ArrExpense.push($scope.ExpenseVM.Expense);
                            $scope.ExpensesVM.Paging.TotalItems +=1;
                        }
                        $("#popupExpense").modal("hide");
                    });
                    $scope.ExpenseVM.finishEditExpense($scope.ExpenseVM.Expense);
                } else {
                    $('.validateinput:first').focus();
                }
            };
            
            
            $scope.InitData();
        };

        return new AdminExpenseController();
    }
})(angular);
