(function(angular) {
angular
    .module("homer")
    .controller("AdminIncomeController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function AdminIncomeController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        AdminIncomeController.prototype = Object.create(AbstractController.prototype);
        AdminIncomeController.prototype.constructor = AdminIncomeController;

        AdminIncomeController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.IncomesVM = null;
            $scope.IncomeVM = null;
            $scope.CustomersVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var incomesvm = $injector.instantiate(IncomesPageViewModel);
                incomesvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomesVM = incomesvm;

                var incomevm = $injector.instantiate(IncomeViewModel);
                incomevm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomeVM = incomevm;

                var customersvm = $injector.instantiate(CustomersViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;
                $scope.CustomersVM.InitData();
                //set view model relation
                //int main view model

                $scope.IncomesVM.InitData();
            };
            $scope.removeIncome = function (item) {
                $scope.IncomesVM.removeIncome(item);
            };
            $scope.checkValIncome = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValIncome(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValIncome(valfield.Name, item);
                    });
                }
            }
            function ValIncome(fieldname, item) {
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
            $scope.onChangeIncome_CustomerId = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncome("CustomerId", item);
                }
            };
            $scope.checkEditingIncome = function () {
                var isedit = false;
                angular.forEach($scope.IncomesVM.ArrIncome, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingIncome()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupIncome = function (item) {
                $scope.IncomeVM.Income = null;
                $scope.IncomeVM.SetId(0);

                $scope.IncomeVM.SetFFInit(function() {
                    $('#popupIncome').on('hide.bs.modal', function () {
                        if ($scope.IncomeVM.Income.isedit == true) {
                            $scope.IncomeVM.Income.isedit = false;
                            $scope.IncomeVM.cancelEditIncome($scope.IncomeVM.Income);
                        }
                    });
                    $("#popupIncome").modal("show");
                });
                $scope.IncomeVM.InitData();
            };
            $scope.startEditPopupIncome = function (item) {
                $scope.IncomeVM.Income = item;
                $scope.IncomeVM.startEditIncome($scope.IncomeVM.Income);
                $('#popupIncome').on('hide.bs.modal', function () {
                    if ($scope.IncomeVM.Income.isedit == true) {
                        $scope.IncomeVM.cancelEditIncome($scope.IncomeVM.Income);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupIncome").modal("show");
            };
            $scope.finishEditPopupIncome = function () {
                $scope.checkValIncome("All", $scope.IncomeVM.Income);
                if ($scope.IncomeVM.Income.valmanager.IsValid) {
                    $scope.IncomeVM.SetFFSave(function () {
                          $scope.IncomeVM.Income.InvoiceDateF = parseDateDisplay($scope.IncomeVM.Income.InvoiceDate);
                          $scope.IncomeVM.Income.DueDateF = parseDateDisplay($scope.IncomeVM.Income.DueDate);
                        var item = $filter('filter')($scope.IncomesVM.ArrIncome, { Id: $scope.IncomeVM.Income.Id })[0];
                        if(item==null){
                            $scope.IncomesVM.ArrIncome.push($scope.IncomeVM.Income);
                            $scope.IncomesVM.Paging.TotalItems +=1;
                        }
                        $("#popupIncome").modal("hide");
                    });
                    $scope.IncomeVM.finishEditIncome($scope.IncomeVM.Income);
                } else {
                    $('.validateinput:first').focus();
                }
            };
            
            
            $scope.InitData();
        };

        return new AdminIncomeController();
    }
})(angular);
