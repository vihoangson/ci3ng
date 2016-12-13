(function(angular) {
    angular
        .module("homer")
        .controller("ManagementProductController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function ManagementProductController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ManagementProductController.prototype = Object.create(AbstractController.prototype);
        ManagementProductController.prototype.constructor = ManagementProductController;

        ManagementProductController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.ProductsVM = null;
            $scope.ProductVM = null;
            $scope.CategorysVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var productsvm = $injector.instantiate(ProductsPageViewModel);
                productsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ProductsVM = productsvm;

                var productvm = $injector.instantiate(ProductViewModel);
                productvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ProductVM = productvm;

                var categorysvm = $injector.instantiate(CategorysViewModel);
                categorysvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CategorysVM = categorysvm;
                $scope.CategorysVM.InitData();
                //set view model relation
                //int main view model

                $scope.ProductsVM.InitData();
            };
            $scope.removeProduct = function (item) {
                $scope.ProductsVM.removeProduct(item);
            };
            $scope.checkValProduct = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValProduct(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValProduct(valfield.Name, item);
                    });
                }
            }
            function ValProduct(fieldname, item) {
                switch (fieldname) {
                    case "Name":
                        if (item.Name == "" || item.Name == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "UnitPrice":
                        if (item.UnitPrice == "" || item.UnitPrice == null) {
                            item.valmanager.Set(fieldname, true, "");
                        } else {
                            if (isNaN(item.UnitPrice))
                            {
                                item.valmanager.Set(fieldname, false, "Invalid");
                            }
                            else
                            {
                                item.valmanager.Set(fieldname, true, "");
                            }
                        }
                        break;
                    case "CategoryId":
                        if (item.CategoryId == "" || item.CategoryId == null) {

                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                }
            }
            $scope.onChangeProduct_Name = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValProduct("Name", item);
                }
            };
            $scope.onChangeProduct_UnitPrice = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValProduct("UnitPrice", item);
                }
            };
            $scope.onChangeProduct_CategoryId = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValProduct("CategoryId", item);
                }
            };
            $scope.checkEditingProduct = function () {
                var isedit = false;
                angular.forEach($scope.ProductsVM.ArrProduct, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingProduct()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupProduct = function (item) {
                $scope.ProductVM.Product = null;
                $scope.ProductVM.SetId(0);

                $scope.ProductVM.SetFFInit(function() {
                    $('#popupProduct').on('hide.bs.modal', function () {
                        if ($scope.ProductVM.Product.isedit == true) {
                            $scope.ProductVM.Product.isedit = false;
                            $scope.ProductVM.cancelEditProduct($scope.ProductVM.Product);
                        }
                    });
                    $("#popupProduct").modal("show");
                });
                $scope.ProductVM.InitData();
            };
            $scope.startEditPopupProduct = function (item) {
                $scope.ProductVM.Product = item;
                $scope.ProductVM.startEditProduct($scope.ProductVM.Product);
                $('#popupProduct').on('hide.bs.modal', function () {
                    if ($scope.ProductVM.Product.isedit == true) {
                        $scope.ProductVM.cancelEditProduct($scope.ProductVM.Product);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupProduct").modal("show");
            };
            $scope.finishEditPopupProduct = function () {
                $scope.checkValProduct("All", $scope.ProductVM.Product);
                if ($scope.ProductVM.Product.valmanager.IsValid) {
                    $scope.ProductVM.SetFFSave(function () {
                        var item = $filter('filter')($scope.ProductsVM.ArrProduct, { Id: $scope.ProductVM.Product.Id })[0];
                        if(item==null){
                            $scope.ProductsVM.ArrProduct.unshift($scope.ProductVM.Product);
                            $scope.ProductsVM.Paging.TotalItems +=1;
                        }
                        var category = $filter('filter')($scope.CategorysVM.ArrCategory, { Id: $scope.ProductVM.Product.CategoryId })[0];
                        if(category!=null){
                            $scope.ProductVM.Product.CategoryName = category.Name;
                        }
                        if(!$scope.$$phase) { $scope.$apply();}
                        $("#popupProduct").modal("hide");
                    });
                    $scope.ProductVM.finishEditProduct($scope.ProductVM.Product);
                } else {
                    $('.validateinput:first').focus();
                }
            };


            $scope.InitData();
        };

        return new ManagementProductController();
    }
})(angular);
