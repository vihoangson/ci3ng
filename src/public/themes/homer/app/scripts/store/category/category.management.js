(function(angular) {
angular
    .module("homer")
    .controller("ManagementCategoryController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function ManagementCategoryController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ManagementCategoryController.prototype = Object.create(AbstractController.prototype);
        ManagementCategoryController.prototype.constructor = ManagementCategoryController;

        ManagementCategoryController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.CategorysVM = null;
            $scope.CategoryVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var categorysvm = $injector.instantiate(CategorysPageViewModel);
                categorysvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CategorysVM = categorysvm;

                var categoryvm = $injector.instantiate(CategoryViewModel);
                categoryvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CategoryVM = categoryvm;

                $scope.CategorysVM.InitData();
            };
            $scope.removeCategory = function (item) {
                $scope.CategorysVM.removeCategory(item);
            };
            $scope.checkValCategory = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValCategory(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValCategory(valfield.Name, item);
                    });
                }
            }
            function ValCategory(fieldname, item) {
                switch (fieldname) {
                case "Name":
                    if (item.Name == "" || item.Name == null) {
                        item.valmanager.Set(fieldname, false, "*");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                }
            }
            $scope.onChangeCategory_Name = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCategory("Name", item);
                }
            };
            $scope.checkEditingCategory = function () {
                var isedit = false;
                angular.forEach($scope.CategorysVM.ArrCategory, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingCategory()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupCategory = function (item) {
                $scope.CategoryVM.Category = null;
                $scope.CategoryVM.SetId(0);

                $scope.CategoryVM.SetFFInit(function() {
                    $('#popupCategory').on('hide.bs.modal', function () {
                        if ($scope.CategoryVM.Category.isedit == true) {
                            $scope.CategoryVM.Category.isedit = false;
                            $scope.CategoryVM.cancelEditCategory($scope.CategoryVM.Category);
                        }
                    });
                    $("#popupCategory").modal("show");
                });
                $scope.CategoryVM.InitData();
            };
            $scope.startEditPopupCategory = function (item) {
                $scope.CategoryVM.Category = item;
                $scope.CategoryVM.startEditCategory($scope.CategoryVM.Category);
                $('#popupCategory').on('hide.bs.modal', function () {
                    if ($scope.CategoryVM.Category.isedit == true) {
                        $scope.CategoryVM.cancelEditCategory($scope.CategoryVM.Category);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupCategory").modal("show");
            };
            $scope.finishEditPopupCategory = function () {
                $scope.checkValCategory("All", $scope.CategoryVM.Category);
                if ($scope.CategoryVM.Category.valmanager.IsValid) {
                    $scope.CategoryVM.SetFFSave(function () {
                        var item = $filter('filter')($scope.CategorysVM.ArrCategory, { Id: $scope.CategoryVM.Category.Id })[0];
                        if(item==null){
                            $scope.CategorysVM.ArrCategory.push($scope.CategoryVM.Category);
                            $scope.CategorysVM.Paging.TotalItems +=1;
                        }
                        $("#popupCategory").modal("hide");
                    });
                    $scope.CategoryVM.finishEditCategory($scope.CategoryVM.Category);
                } else {
                    $('.validateinput:first').focus();
                }
            };


            $scope.InitData();
        };

        return new ManagementCategoryController();
    }
})(angular);
