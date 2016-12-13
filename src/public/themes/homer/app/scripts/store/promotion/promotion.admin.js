(function(angular) {
angular
    .module("homer")
    .controller("AdminPromotionController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function AdminPromotionController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        AdminPromotionController.prototype = Object.create(AbstractController.prototype);
        AdminPromotionController.prototype.constructor = AdminPromotionController;

        AdminPromotionController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.PromotionsVM = null;
            $scope.PromotionVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var promotionsvm = $injector.instantiate(PromotionsPageViewModel);
                promotionsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.PromotionsVM = promotionsvm;

                var promotionvm = $injector.instantiate(PromotionViewModel);
                promotionvm.InitModel($scope.Transition, $scope.Processing);
                $scope.PromotionVM = promotionvm;

                //set view model relation
                //int main view model

                $scope.PromotionsVM.InitData();
            };
            $scope.removePromotion = function (item) {
                $scope.PromotionsVM.removePromotion(item);
            };
            $scope.checkValPromotion = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValPromotion(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValPromotion(valfield.Name, item);
                    });
                }
            }
            function ValPromotion(fieldname, item) {
                switch (fieldname) {
                case "Type":
                    if (item.Type == "" || item.Type == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                case "Name":
                    if (item.Name == "" || item.Name == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                case "StartDate":
                    if (item.StartDate == "" || item.StartDate == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                case "StopDate":
                    if (item.StopDate == "" || item.StopDate == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                }
            }
            $scope.onChangePromotion_Type = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValPromotion("Type", item);
                }
            };
            $scope.onChangePromotion_Name = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValPromotion("Name", item);
                }
            };
            $scope.onChangePromotion_StartDate = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValPromotion("StartDate", item);
                }
            };
            $scope.onChangePromotion_StopDate = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValPromotion("StopDate", item);
                }
            };
            $scope.checkEditingPromotion = function () {
                var isedit = false;
                angular.forEach($scope.PromotionsVM.ArrPromotion, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingPromotion()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupPromotion = function (item) {
                $scope.PromotionVM.Promotion = null;
                $scope.PromotionVM.SetId(0);

                $scope.PromotionVM.SetFFInit(function() {
                    $('#popupPromotion').on('hide.bs.modal', function () {
                        if ($scope.PromotionVM.Promotion.isedit == true) {
                            $scope.PromotionVM.Promotion.isedit = false;
                            $scope.PromotionVM.cancelEditPromotion($scope.PromotionVM.Promotion);
                        }
                    });
                    $("#popupPromotion").modal("show");
                });
                $scope.PromotionVM.InitData();
            };
            $scope.startEditPopupPromotion = function (item) {
                $scope.PromotionVM.Promotion = item;
                $scope.PromotionVM.startEditPromotion($scope.PromotionVM.Promotion);
                $('#popupPromotion').on('hide.bs.modal', function () {
                    if ($scope.PromotionVM.Promotion.isedit == true) {
                        $scope.PromotionVM.cancelEditPromotion($scope.PromotionVM.Promotion);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupPromotion").modal("show");
            };
            $scope.finishEditPopupPromotion = function () {
                $scope.checkValPromotion("All", $scope.PromotionVM.Promotion);
                if ($scope.PromotionVM.Promotion.valmanager.IsValid) {
                    $scope.PromotionVM.SetFFSave(function () {
                          $scope.PromotionVM.Promotion.StartDateF = parseDateDisplay($scope.PromotionVM.Promotion.StartDate);
                          $scope.PromotionVM.Promotion.StopDateF = parseDateDisplay($scope.PromotionVM.Promotion.StopDate);
                        var item = $filter('filter')($scope.PromotionsVM.ArrPromotion, { Id: $scope.PromotionVM.Promotion.Id })[0];
                        if(item==null){
                            $scope.PromotionsVM.ArrPromotion.push($scope.PromotionVM.Promotion);
                            $scope.PromotionsVM.Paging.TotalItems +=1;
                        }
                        $("#popupPromotion").modal("hide");
                    });
                    $scope.PromotionVM.finishEditPromotion($scope.PromotionVM.Promotion);
                } else {
                    $('.validateinput:first').focus();
                }
            };
            
            
            $scope.InitData();
        };

        return new AdminPromotionController();
    }
})(angular);
