(function(angular) {
    angular.module("homer").controller("DetailExpenseController", Anonymous);
    function Anonymous($scope, AbstractController, $injector, $filter,$location, $stateParams) {
        function DetailExpenseController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }

        DetailExpenseController.prototype = Object.create(AbstractController.prototype);
        DetailExpenseController.prototype.constructor = DetailExpenseController;

        DetailExpenseController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.ExpenseVM = null;
            $scope.ExpenseDetailsVM = null;
            $scope.SearchProductsVM = null;
            $scope.CategorysVM = null;
            $scope.Type = null;
            $scope.InitData = function() {
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var expensevm = $injector.instantiate(ExpenseViewModel);
                expensevm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpenseVM = expensevm;

                var expensedetailsvm = $injector.instantiate(ExpenseDetailsViewModel);
                expensedetailsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.ExpenseDetailsVM = expensedetailsvm;

                var categorysvm = $injector.instantiate(CategorysViewModel);
                categorysvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CategorysVM = categorysvm;
                
                var searchproductsvm = $injector.instantiate(ProductsPageViewModel);
                searchproductsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.SearchProductsVM = searchproductsvm;
                $scope.SearchProductsVM.Paging.PageSize = 5;

                //init and load data for view model
                $scope.ExpenseVM.SetFFInit(function() {
                    if ($scope.ExpenseVM.Id > 0) {
                        if ($scope.Type == null) {
                            $scope.Type = $scope.ExpenseVM.Expense.Type;
                        }
                        $scope.ExpenseDetailsVM.SetSearchParam("ExpenseId", $scope.ExpenseVM.Id);
                        $scope.ExpenseDetailsVM.InitData();
                    } else {
                        $scope.ExpenseVM.Expense.Type = $scope.Type;
                        if($scope.Type=="ProductPurchase"){
                            $scope.ExpenseVM.Expense.UpdateStock = true;
                        }
                    }
                });
                var id = $stateParams.id;
                if (id == null) {
                    id = 0;
                } else {
                    id = parseInt(id);
                }
                $scope.Type = $stateParams.type;
                $scope.ExpenseVM.SetId(id);

                $scope.ExpenseVM.InitData();
                if($scope.Type=='ProductPurchase'){
                    $scope.CategorysVM.InitData();
                }
            };
            $scope.startEditExpense = function() {
                $scope.ExpenseVM.startEditExpense($scope.ExpenseVM.Expense);
                angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(expensedetail) {
                    $scope.ExpenseDetailsVM.startEditExpenseDetail(expensedetail);
                });
            };
            $scope.finishEditExpense = function() {
                if ($scope.validateViewModel()) {
                    $scope.ExpenseVM.SetFFSave(function() {
                        $scope.ExpenseVM.Expense.InvoiceDateF = parseDateDisplay($scope.ExpenseVM.Expense.InvoiceDate);
                        if ($scope.ExpenseDetailsVM.ArrExpenseDetail.length > 0) {
                            angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(expensedetail1) {
                                expensedetail1.ExpenseId = $scope.ExpenseVM.Expense.Id;
                            });
                            $scope.ExpenseDetailsVM.SetFFSaveAll(function() {
                                if (!$scope.$$phase) {
                                    $scope.$apply();

                                }
                                if($scope.Processing.Completed ==100){
                                    if($location.path()=="/expense/detail//ProductPurchase"||$location.path()=="/expense/detail//Bill"){
                                        $location.path("expense/detail/"+$scope.ExpenseVM.Expense.Id+"/"+$scope.ExpenseVM.Expense.Type);
                                    }
                                }
                            });
                            $scope.ExpenseDetailsVM.saveAllExpenseDetail();
                        }
                    });
                    if ($scope.ExpenseDetailsVM.ArrExpenseDetail.length > 0) {
                        angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(ex) {
                            ex.UpdateStock = $scope.ExpenseVM.Expense.UpdateStock;
                        });
                    }
                    $scope.ExpenseVM.finishEditExpense($scope.ExpenseVM.Expense);
                }
            };
            $scope.cancelEditExpense = function() {
                $scope.ExpenseVM.cancelEditExpense($scope.ExpenseVM.Expense);
                $scope.ExpenseVM.Expense.valmanager.Reset();
                $scope.ExpenseDetailsVM.ArrExpenseDetail = $filter('filter')($scope.ExpenseDetailsVM.ArrExpenseDetail,function(item){ return item.Id>0;});
                angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(expensedetail) {
                    expensedetail.editmode = "";
                    expensedetail.valmanager.Reset();
                    $scope.ExpenseDetailsVM.cancelEditExpenseDetail(expensedetail);
                });
            };
            $scope.removeListExpenseDetail = function(item) {
                $scope.ExpenseDetailsVM.SetFFDelete(function() {
                    RecalExpense();
                    RecalExpenseDetail();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
                $scope.ExpenseDetailsVM.removeListExpenseDetail(item);
                RecalExpense();
                RecalExpenseDetail();
            };
            $scope.startAddExpenseDetail = function() {
                $scope.ExpenseDetailsVM.startAddListExpenseDetail();
                $scope.ExpenseVM.Expense.valmanager.Set("DetailLength", true, "");
            };
            $scope.checkEditingExpense = function() {
                var isediting = false;
                isediting = $scope.ExpenseVM.Expense != null && $scope.ExpenseVM.Expense.isedit;
                var expensedetail = $filter('filter')($scope.ExpenseDetailsVM.ArrExpenseDetail, {isedit: true})[0];
                if (expensedetail != null) {
                    if (isediting == false) {
                        isediting = true;
                    }
                }
                return isediting;
            };
            window.onbeforeunload = function() {
                if ($scope.checkEditingExpense) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.validateViewModel = function() {
                $scope.checkValExpense("All", $scope.ExpenseVM.Expense);
                angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(expensedetail) {
                    $scope.checkValExpenseDetail("All", expensedetail);
                });
                var isval = false;
                isval = $scope.ExpenseVM.Expense.valmanager.IsValid;
                if (isval == true && $scope.ExpenseDetailsVM.ArrExpenseDetail.length > 0) {
                    angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(item) {
                        if(item.valmanager.IsValid == false&&isval==true){ isval = false; }
                    });
                }
                if (isval == false) {
                    $('.validateinput:first').focus();
                    return false;
                } else {
                    return true;
                }
            };
            $scope.checkValExpense = function(casename, expense) {
                if (casename != "All") {
                    //logic for validate form
                    ValExpense(casename, expense);
                    //end logic
                } else {
                    expense.valmanager.Reset();
                    angular.forEach(expense.valmanager.ArrValidateField, function(valfield) {
                        ValExpense(valfield.Name, expense);
                    });
                }
            };
            $scope.checkValExpenseDetail = function(casename, expensedetail) {
                if (casename != "All") {
                    //logic for validate form
                    ValExpenseDetail(casename, expensedetail);
                    //end logic
                } else {
                    expensedetail.valmanager.Reset();
                    angular.forEach(expensedetail.valmanager.ArrValidateField, function(valfield) {
                        ValExpenseDetail(valfield.Name, expensedetail);
                    });
                }
            };
            function ValExpense(fieldname, item) {
                switch (fieldname) {
                    case "Description":
                        if (item.Description == "" || item.Description == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "InvoiceDate":
                        if (item.InvoiceDate == "" || item.InvoiceDate == null) {
                            item.valmanager.Set(fieldname, false, "Invalid");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "DetailLength":
                        if ($scope.ExpenseDetailsVM.ArrExpenseDetail.length <= 0) {
                            item.valmanager.Set(fieldname, false, "You must add at least 1 item detail.");
                        } else {
                            var deleteitem = $filter("filter")($scope.ExpenseDetailsVM.ArrExpenseDetail, {editmode: "Delete"});
                            if ($scope.ExpenseDetailsVM.ArrExpenseDetail.length == deleteitem.length) {
                                item.valmanager.Set(fieldname, false, "You must add at least 1 item detail.");
                            } else {
                                item.valmanager.Set(fieldname, true, "");
                            }
                        }
                        break;
                }
            }

            $scope.onChangeExpense_Description = function(expense) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValExpense("Description", expense);
                }
            };
            $scope.onChangeExpense_InvoiceDate = function(expense) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValExpense("InvoiceDate", expense);
                }
            };
            function ValExpenseDetail(fieldname, item) {
                switch (fieldname) {

                    case "ItemName":
                        if (item.ItemName == "" || item.ItemName == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "Quantity":
                        if ($scope.ExpenseVM.Expense.Type == 'ProductPurchase') {
                            if (item.Quantity != 0 && (item.Quantity == "" || item.Quantity == null)) {
                                item.valmanager.Set(fieldname, false, "*");
                            } else {
                                if (isNaN(item.Quantity) || item.Quantity <= 0) {
                                    item.valmanager.Set(fieldname, false, "Invalid");
                                } else {
                                    item.valmanager.Set(fieldname, true, "");
                                }
                            }
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "UnitPrice":
                        if (item.UnitPrice != 0 && (item.UnitPrice == "" || item.UnitPrice == null)) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            if (isNaN(item.UnitPrice) || item.UnitPrice < 0) {
                                item.valmanager.Set(fieldname, true, "Invalid");
                            } else {
                                item.valmanager.Set(fieldname, true, "");
                            }
                        }
                        break;
                }
            }


            $scope.onChangeExpenseDetail_ItemName = function(expensedetail) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValExpenseDetail("ItemName", expensedetail);
                }
            };
            $scope.onChangeExpenseDetail_Quantity = function(expensedetail) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValExpenseDetail("Quantity", expensedetail);
                    RecalExpenseDetail();
                    RecalExpense();
                }
            };

            $scope.onChangeExpenseDetail_UnitPrice = function(expensedetail) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValExpenseDetail("UnitPrice", expensedetail);
                    RecalExpenseDetail();
                    RecalExpense();
                }
            };

            function RecalExpense() {
                var total = 0;
                angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(detail) {
                    if (detail.editmode != "Delete") {
                        if ($scope.ExpenseVM.Expense.Type == 'Bill') {
                            total += parseFloat(detail.UnitPrice);
                        } else {
                            total += parseFloat(detail.Quantity) * parseFloat(detail.UnitPrice);
                        }
                    }
                });
                $scope.ExpenseVM.Expense.Amount = total;
            }

            function RecalExpenseDetail() {
                angular.forEach($scope.ExpenseDetailsVM.ArrExpenseDetail, function(detail) {
                    if ($scope.ExpenseVM.Expense.Type == 'Bill') {

                    } else {
                        detail.Total = parseFloat(detail.Quantity) * parseFloat(detail.UnitPrice);
                    }
                });
            }

            $scope.startAddPopupExpenseDetail = function() {
                $scope.SearchProductsVM.SetSearchParam("Type", "");
                $scope.SearchProductsVM.SetSearchParam("Name", "");
                $scope.SearchProductsVM.SetSearchParam("CategoryId", "");
                $scope.SearchProductsVM.InitData();
                $("#popupProduct").modal("show");
                $('#myTab a:first').tab('show');
            };
            $scope.finishAddPopupProduct = function() {
                angular.forEach($scope.SearchProductsVM.ArrSProduct, function(p) {
                    var d = new ExpenseDetail(0, 0, p.Id, p.Name, 1, p.UnitPrice);
                    d.guid = p.guid;
                    d.editmode = "New";
                    $scope.ExpenseDetailsVM.ArrExpenseDetail.push(d);
                    $scope.ExpenseDetailsVM.startEditListExpenseDetail(d);
                });
                RecalExpense();
                RecalExpenseDetail();
                $scope.SearchProductsVM.ArrSProduct = new Array();
                $("#popupProduct").modal("hide");
            };
            $scope.selectProduct = function(item) {
                var item1 = angular.copy(item);
                $scope.SearchProductsVM.ArrSProduct.push(item1);
            };
            $scope.unselectProduct = function(item) {
                $scope.SearchProductsVM.ArrSProduct.splice($scope.SearchProductsVM.ArrSProduct.indexOf(item), 1);
            };
            $scope.InitData();
        };

        return new DetailExpenseController();
    }
})(angular);
