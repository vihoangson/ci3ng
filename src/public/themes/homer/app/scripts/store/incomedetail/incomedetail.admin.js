(function() {

angular.module("homer").controller("AdminIncomeDetailController", Anonymous);

function Anonymous($scope, $injector, $filter, AbstractController) {
    function AdminIncomeDetailController() {
        this.__super__.constructor.apply(this, arguments);
        // AbstractController.apply(this, arguments.callee.caller.arguments);
    }
    extend(AdminIncomeDetailController, AbstractController);
    // AdminIncomeDetailController.prototype = Object.create(AbstractController.prototype);
    // AdminIncomeDetailController.prototype.constructor = AdminIncomeDetailController;

    AdminIncomeDetailController.prototype.initData = function() {
        $scope.Processing = null;
        $scope.Transition = null;
        $scope.IncomeDetailsVM = null;
        $scope.IncomeDetailVM = null;
        $scope.IncomesVM = null;
        $scope.ProductsVM = null;
        $scope.InitData = function() {
            //define view model
            $scope.Processing = $injector.instantiate(ModelProcessing);
            $scope.Transition = $injector.instantiate(ModelTransition);

            var incomedetailsvm = $injector.instantiate(IncomeDetailsPageViewModel);
            incomedetailsvm.InitModel($scope.Transition, $scope.Processing);
            $scope.IncomeDetailsVM = incomedetailsvm;

            var incomedetailvm = $injector.instantiate(IncomeDetailViewModel);
            incomedetailvm.InitModel($scope.Transition, $scope.Processing);
            $scope.IncomeDetailVM = incomedetailvm;

            var incomesvm = $injector.instantiate(IncomesViewModel);
            incomesvm.InitModel($scope.Transition, $scope.Processing);
            $scope.IncomesVM = incomesvm;
            $scope.IncomesVM.InitData();
            var productsvm = $injector.instantiate(ProductsViewModel);
            productsvm.InitModel($scope.Transition, $scope.Processing);
            $scope.ProductsVM = productsvm;
            $scope.ProductsVM.InitData();
            //set view model relation
            //int main view model

            $scope.IncomeDetailsVM.InitData();
        };
        $scope.removeIncomeDetail = function(item) {
            $scope.IncomeDetailsVM.removeIncomeDetail(item);
        };
        $scope.checkValIncomeDetail = function(casename, item) {
            if (casename != "All") {
                //logic for validate form
                ValIncomeDetail(casename, item);
                //end logic
            } else {
                item.valmanager.Reset();
                angular.forEach(item.valmanager.ArrValidateField, function(valfield) {
                    ValIncomeDetail(valfield.Name, item);
                });
            }
        }
        function ValIncomeDetail(fieldname, item) {
            switch (fieldname) {
                case "ProductId":
                    if (item.ProductId == "" || item.ProductId == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
            }
        }

        $scope.onChangeIncomeDetail_ProductId = function(item) {
            if ($scope.Processing.Completed == 100) {
                $scope.checkValIncomeDetail("ProductId", item);
            }
        };
        $scope.checkEditingIncomeDetail = function() {
            var isedit = false;
            angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(item) {
                if (item.isedit) {
                    if (isedit == false) isedit = true;
                }
            });
            return isedit;
        };
        window.onbeforeunload = function() {
            if ($scope.checkEditingIncomeDetail()) {
                return "Do you wish to leave this page? Any unsaved data will be deleted.";
            }
        };
        $scope.startAddPopupIncomeDetail = function(item) {
            $scope.IncomeDetailVM.IncomeDetail = null;
            $scope.IncomeDetailVM.SetId(0);

            $scope.IncomeDetailVM.SetFFInit(function() {
                $('#popupIncomeDetail').on('hide.bs.modal', function() {
                    if ($scope.IncomeDetailVM.IncomeDetail.isedit == true) {
                        $scope.IncomeDetailVM.IncomeDetail.isedit = false;
                        $scope.IncomeDetailVM.cancelEditIncomeDetail($scope.IncomeDetailVM.IncomeDetail);
                    }
                });
                $("#popupIncomeDetail").modal("show");
            });
            $scope.IncomeDetailVM.InitData();
        };
        $scope.startEditPopupIncomeDetail = function(item) {
            $scope.IncomeDetailVM.IncomeDetail = item;
            $scope.IncomeDetailVM.startEditIncomeDetail($scope.IncomeDetailVM.IncomeDetail);
            $('#popupIncomeDetail').on('hide.bs.modal', function() {
                if ($scope.IncomeDetailVM.IncomeDetail.isedit == true) {
                    $scope.IncomeDetailVM.cancelEditIncomeDetail($scope.IncomeDetailVM.IncomeDetail);
                }
                if (!$scope.$$phase) { $scope.$apply();}
            });
            $("#popupIncomeDetail").modal("show");
        };
        $scope.finishEditPopupIncomeDetail = function() {
            $scope.checkValIncomeDetail("All", $scope.IncomeDetailVM.IncomeDetail);
            if ($scope.IncomeDetailVM.IncomeDetail.valmanager.IsValid) {
                $scope.IncomeDetailVM.SetFFSave(function() {
                    var item = $filter('filter')($scope.IncomeDetailsVM.ArrIncomeDetail, {Id: $scope.IncomeDetailVM.IncomeDetail.Id})[0];
                    if (item == null) {
                        $scope.IncomeDetailsVM.ArrIncomeDetail.push($scope.IncomeDetailVM.IncomeDetail);
                        $scope.IncomeDetailsVM.Paging.TotalItems += 1;
                    }
                    $("#popupIncomeDetail").modal("hide");
                });
                $scope.IncomeDetailVM.finishEditIncomeDetail($scope.IncomeDetailVM.IncomeDetail);
            } else {
                $('.validateinput:first').focus();
            }
        };


        $scope.InitData();
    };

    // return new AdminIncomeDetailController();
    return AdminIncomeDetailController.newInstance(arguments);
}

})();
