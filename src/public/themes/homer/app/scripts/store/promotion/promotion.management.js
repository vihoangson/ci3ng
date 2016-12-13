(function(angular) {
angular
    .module("homer")
    .controller("ManagementPromotionController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function ManagementPromotionController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ManagementPromotionController.prototype = Object.create(AbstractController.prototype);
        ManagementPromotionController.prototype.constructor = ManagementPromotionController;

        ManagementPromotionController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.PromotionsVM = null;
            $scope.PromotionVM = null;
            $scope.StartDate = null;
            $scope.EndDate = null;
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
                        if(item.StartDate!=null&&item.StopDate!=null&&moment(item.StartDate).diff(moment(item.StopDate), 'days')>0){
                            item.valmanager.Set(fieldname, false, "Start Date must be less than Stop Date");
                        }else{
                            item.valmanager.Set(fieldname, true, "");
                        }
                    }
                    break;
                case "StopDate":
                    if (item.StopDate == "" || item.StopDate == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        if(item.StartDate!=null&&item.StopDate!=null&&moment(item.StartDate).diff(moment(item.StopDate), 'days')>0){
                            item.valmanager.Set(fieldname, false, "Stop Date must be greater than Start Date");
                        }else{
                            item.valmanager.Set(fieldname, true, "");
                        }
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
            $scope.onChange_StartDate = function () {
                if ($scope.Processing.Completed == 100) {
                    if($scope.StartDate!=null) {
                        $scope.PromotionsVM.SetSearchParam("GreaterOrEqualStartDate", parseJsonDateS($scope.StartDate));
                    }else{
                        $scope.PromotionsVM.SetSearchParam("GreaterOrEqualStartDate", "");
                    }
                    $scope.PromotionsVM.searchPromotions();
                }
            };
            $scope.onChange_EndDate = function () {
                if ($scope.Processing.Completed == 100) {
                    if($scope.EndDate!=null) {
                        $scope.PromotionsVM.SetSearchParam("GreaterOrEqualEndDate", parseJsonDateS($scope.EndDate));
                    }else{
                        $scope.PromotionsVM.SetSearchParam("GreaterOrEqualEndDate", "");

                    }
                    $scope.PromotionsVM.searchPromotions();
                }
            };
            
            $scope.InitData();
        };

        return new ManagementPromotionController();
    }
})(angular);
