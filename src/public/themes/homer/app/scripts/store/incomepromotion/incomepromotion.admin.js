(function(angular) {
angular
    .module("homer")
    .controller("AdminIncomePromotionController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function AdminIncomePromotionController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        AdminIncomePromotionController.prototype = Object.create(AbstractController.prototype);
        AdminIncomePromotionController.prototype.constructor = AdminIncomePromotionController;

        AdminIncomePromotionController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.IncomePromotionsVM = null;
            $scope.IncomePromotionVM = null;
            $scope.IncomesVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var incomepromotionsvm = $injector.instantiate(IncomePromotionsPageViewModel);
                incomepromotionsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomePromotionsVM = incomepromotionsvm;

                var incomepromotionvm = $injector.instantiate(IncomePromotionViewModel);
                incomepromotionvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomePromotionVM = incomepromotionvm;

                var incomesvm = $injector.instantiate(IncomesViewModel);
                incomesvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomesVM = incomesvm;
                $scope.IncomesVM.InitData();
                //set view model relation
                //int main view model

                $scope.IncomePromotionsVM.InitData();
            };
            $scope.removeIncomePromotion = function (item) {
                $scope.IncomePromotionsVM.removeIncomePromotion(item);
            };
            $scope.checkValIncomePromotion = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValIncomePromotion(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValIncomePromotion(valfield.Name, item);
                    });
                }
            }
            function ValIncomePromotion(fieldname, item) {
                switch (fieldname) {
                case "PromotionName":
                    if (item.PromotionName == "" || item.PromotionName == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                }
            }
            $scope.onChangeIncomePromotion_PromotionName = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncomePromotion("PromotionName", item);
                }
            };
            $scope.checkEditingIncomePromotion = function () {
                var isedit = false;
                angular.forEach($scope.IncomePromotionsVM.ArrIncomePromotion, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingIncomePromotion()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupIncomePromotion = function (item) {
                $scope.IncomePromotionVM.IncomePromotion = null;
                $scope.IncomePromotionVM.SetId(0);

                $scope.IncomePromotionVM.SetFFInit(function() {
                    $('#popupIncomePromotion').on('hide.bs.modal', function () {
                        if ($scope.IncomePromotionVM.IncomePromotion.isedit == true) {
                            $scope.IncomePromotionVM.IncomePromotion.isedit = false;
                            $scope.IncomePromotionVM.cancelEditIncomePromotion($scope.IncomePromotionVM.IncomePromotion);
                        }
                    });
                    $("#popupIncomePromotion").modal("show");
                });
                $scope.IncomePromotionVM.InitData();
            };
            $scope.startEditPopupIncomePromotion = function (item) {
                $scope.IncomePromotionVM.IncomePromotion = item;
                $scope.IncomePromotionVM.startEditIncomePromotion($scope.IncomePromotionVM.IncomePromotion);
                $('#popupIncomePromotion').on('hide.bs.modal', function () {
                    if ($scope.IncomePromotionVM.IncomePromotion.isedit == true) {
                        $scope.IncomePromotionVM.cancelEditIncomePromotion($scope.IncomePromotionVM.IncomePromotion);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupIncomePromotion").modal("show");
            };
            $scope.finishEditPopupIncomePromotion = function () {
                $scope.checkValIncomePromotion("All", $scope.IncomePromotionVM.IncomePromotion);
                if ($scope.IncomePromotionVM.IncomePromotion.valmanager.IsValid) {
                    $scope.IncomePromotionVM.SetFFSave(function () {
                        var item = $filter('filter')($scope.IncomePromotionsVM.ArrIncomePromotion, { Id: $scope.IncomePromotionVM.IncomePromotion.Id })[0];
                        if(item==null){
                            $scope.IncomePromotionsVM.ArrIncomePromotion.push($scope.IncomePromotionVM.IncomePromotion);
                            $scope.IncomePromotionsVM.Paging.TotalItems +=1;
                        }
                        $("#popupIncomePromotion").modal("hide");
                    });
                    $scope.IncomePromotionVM.finishEditIncomePromotion($scope.IncomePromotionVM.IncomePromotion);
                } else {
                    $('.validateinput:first').focus();
                }
            };
            
            
            $scope.InitData();
        };

        return new AdminIncomePromotionController();
    }
})(angular);
