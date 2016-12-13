(function(angular) {
    angular.module("homer").controller("DetailIncomeController", Anonymous);
    function Anonymous($scope, AbstractController, $injector, $filter,$location, $stateParams) {
        function DetailIncomeController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }

        DetailIncomeController.prototype = Object.create(AbstractController.prototype);
        DetailIncomeController.prototype.constructor = DetailIncomeController;

        DetailIncomeController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.CategorysVM = null;
            $scope.CustomersVM = null;
            $scope.PromotionsVM = null;
            $scope.SearchProductsVM = null;
            $scope.IncomeVM = null;
            $scope.IncomeDetailsVM = null;
            $scope.IncomePromotionsVM = null;
            $scope.InitProductsVM = null;
			$scope.hairWalkIn = null;
            $scope.productName = null;
            $scope.InitData = function() {
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var customersvm = $injector.instantiate(CustomersViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;
                $scope.CustomersVM.InitData();

                var promotionsvm = $injector.instantiate(PromotionsViewModel);
                promotionsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.PromotionsVM = promotionsvm;
                $scope.PromotionsVM.SetSearchParam("Status",true);
                $scope.PromotionsVM.InitData();


                var categorysvm = $injector.instantiate(CategorysViewModel);
                categorysvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CategorysVM = categorysvm;
                $scope.CategorysVM.InitData();

                var searchproductsvm = $injector.instantiate(ProductsPageViewModel);
                searchproductsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.SearchProductsVM = searchproductsvm;
                $scope.SearchProductsVM.Paging.PageSize = 5;

                var initproductsvm = $injector.instantiate(ProductsViewModel);
                initproductsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.InitProductsVM = initproductsvm;

                var incomevm = $injector.instantiate(IncomeViewModel);
                incomevm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomeVM = incomevm;

                var incomedetailsvm = $injector.instantiate(IncomeDetailsViewModel);
                incomedetailsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomeDetailsVM = incomedetailsvm;

                var incomepromotionsvm = $injector.instantiate(IncomePromotionsViewModel);
                incomepromotionsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomePromotionsVM = incomepromotionsvm;

                //init and load data for view model
                $scope.IncomeVM.SetFFInit(function() {
                    if ($scope.IncomeVM.Id > 0) {
                        $scope.IncomeDetailsVM.SetSearchParam("IncomeId", $scope.IncomeVM.Id);
                        $scope.IncomeDetailsVM.InitData();
                        $scope.IncomePromotionsVM.SetSearchParam("IncomeId", $scope.IncomeVM.Id);
                        $scope.IncomePromotionsVM.InitData();
                    }
                    else {
						//dafault value for shortcut add walkin
						if($stateParams.hairWalkIn !=null){
							$scope.IncomeVM.Income.Type = 'Cash';
							$scope.IncomeVM.Income.CustomerId = 1;
							$scope.productName = 'Cut Hair'
						}
						if($scope.productName!=null) {
                            $scope.InitProductsVM.SetSearchParam("Name", $scope.productName);
                            $scope.InitProductsVM.SetFFInit(function() {
                                angular.forEach($scope.InitProductsVM.ArrProduct, function(p) {
                                    var d = new IncomeDetail(0, 0, p.Id, 1, p.UnitPrice, 0, "");
                                    d.guid = p.guid;
                                    d.ProductName = p.Name;
                                    d.editmode = "New";
                                    $scope.IncomeDetailsVM.ArrIncomeDetail.push(d);
                                    $scope.IncomeDetailsVM.startEditListIncomeDetail(d);
                                });
                                RecalIncome();
                                RecalIncomeDetail();
                            });
                            $scope.InitProductsVM.InitData();
                        }
                    }
                });
                var id = $stateParams.id;
                if (id == null) {
                    id = 0;
                    if($stateParams.productName!=null) {
                        $scope.productName = $stateParams.productName.replace("-", " ");
                    }
                } else {
                    id = parseInt(id);
                }

                $scope.IncomeVM.SetId(id);
                $scope.IncomeVM.InitData();
            };
            $scope.startEditIncome = function() {
                $scope.IncomeVM.startEditIncome($scope.IncomeVM.Income);
                angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(incomedetail) {
                    $scope.IncomeDetailsVM.startEditIncomeDetail(incomedetail);
                });
                angular.forEach($scope.IncomePromotionsVM.ArrIncomePromotion, function(incomepromotion) {
                    $scope.IncomePromotionsVM.startEditIncomePromotion(incomepromotion);
                });
            };
            $scope.finishEditIncome = function() {
                if ($scope.validateViewModel()) {
                    $scope.IncomeVM.SetFFSave(function() {
                        $scope.IncomeVM.Income.InvoiceDateF = parseDateDisplay($scope.IncomeVM.Income.InvoiceDate);
                        var customer = $filter('filter')($scope.CustomersVM.ArrCustomer, {Id: $scope.IncomeVM.Income.CustomerId})[0];
                        if (customer != null) {
                            $scope.IncomeVM.Income.CustomerName = customer.DisplayName;
                        } else {
                            $scope.IncomeVM.Income.CustomerName = "";
                        }
                        if ($scope.IncomeDetailsVM.ArrIncomeDetail.length > 0) {
                            angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(incomedetail1) {
                                incomedetail1.IncomeId = $scope.IncomeVM.Income.Id;
                            });
                            $scope.IncomeDetailsVM.SetFFSaveAll(
                                function () {
                                    if(!$scope.$$phase) { $scope.$apply();}
                                    if($scope.Processing.Completed ==100){
                                        if($location.path()=="/income/detail/"){
                                            $location.path("income/detail/"+$scope.IncomeVM.Income.Id).reload(false);
                                        }
                                    }
                                }
                            );
                            $scope.IncomeDetailsVM.saveAllIncomeDetail();
                        }
                        if ($scope.IncomePromotionsVM.ArrIncomePromotion.length > 0) {
                            angular.forEach($scope.IncomePromotionsVM.ArrIncomePromotion, function(incomepromotion1) {
                                incomepromotion1.IncomeId = $scope.IncomeVM.Income.Id;
                            });
                            $scope.IncomePromotionsVM.SetFFSaveAll(
                                function () {
                                    if(!$scope.$$phase) { $scope.$apply();}
                                    if($scope.Processing.Completed ==100){
                                        if($location.path()=="/income/detail/"){
                                            $location.path("income/detail/"+$scope.IncomeVM.Income.Id).reload(false);
                                        }
                                    }
                                }
                            );
                            $scope.IncomePromotionsVM.saveAllIncomePromotion();
                        }
                    });
                    if ($scope.IncomeDetailsVM.ArrIncomeDetail.length > 0) {
                        angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(incomedetail1) {
                            incomedetail1.UpdateStock = $scope.IncomeVM.Income.UpdateStock;
                        });
                    }
                    $scope.IncomeVM.finishEditIncome($scope.IncomeVM.Income);
                }
            };
            $scope.cancelEditIncome = function() {
                $scope.IncomeVM.cancelEditIncome($scope.IncomeVM.Income);
                $scope.IncomeVM.Income.valmanager.Reset();
                $scope.IncomeDetailsVM.ArrIncomeDetail = $filter('filter')($scope.IncomeDetailsVM.ArrIncomeDetail,function(item){ return item.Id>0;});
                angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(incomedetail) {
                    incomedetail.editmode="";
                    incomedetail.valmanager.Reset();
                    $scope.IncomeDetailsVM.cancelEditIncomeDetail(incomedetail);
                });
                $scope.IncomePromotionsVM.ArrIncomePromotion = $filter('filter')($scope.IncomePromotionsVM.ArrIncomePromotion,function(item){ return item.Id>0;});
                angular.forEach($scope.IncomePromotionsVM.ArrIncomePromotion, function(incomepromotion) {
                    incomepromotion.editmode = "";
                    incomepromotion.valmanager.Reset();
                    $scope.IncomePromotionsVM.cancelEditIncomePromotion(incomepromotion);
                });

            };
            $scope.removeListIncomeDetail = function(item) {
                $scope.IncomeDetailsVM.SetFFDelete(
                    function () {
                        RecalIncome();
                        RecalIncomeDetail();
                        if(!$scope.$$phase) { $scope.$apply();}
                    }
                );
                $scope.IncomeDetailsVM.removeListIncomeDetail(item);
                RecalIncome();
            };
            $scope.startAddIncomeDetail = function(item) {
                $scope.IncomeDetailsVM.startAddListIncomeDetail(item);
                $scope.IncomeVM.Income.valmanager.Set("DetailLength", true, "");
            };
            $scope.removeListIncomePromotion = function(item) {
                $scope.IncomePromotionsVM.SetFFDelete(function () {
                    if(!$scope.$$phase) $scope.$apply();
                });
                $scope.IncomePromotionsVM.removeListIncomePromotion(item);
            };
            $scope.startAddIncomePromotion = function(item) {
                $scope.IncomePromotionsVM.startAddIncomePromotion(item);
            };
            $scope.checkEditingIncome = function() {
                var isediting = false;
                isediting = $scope.IncomeVM.Income != null && $scope.IncomeVM.Income.isedit;
                var incomedetail = $filter('filter')($scope.IncomeDetailsVM.ArrIncomeDetail, {isedit: true})[0]
                if (incomedetail != null) {
                    if (isediting == false) {
                        isediting = true;
                    }
                }
                var incomepromotion = $filter('filter')($scope.IncomePromotionsVM.ArrIncomePromotion, {isedit: true})[0]
                if (incomepromotion != null) {
                    if (isediting == false) {
                        isediting = true;
                    }
                }
                return isediting;
            };
            window.onbeforeunload = function() {
                if ($scope.checkEditingIncome) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.validateViewModel = function() {
                $scope.checkValIncome("All", $scope.IncomeVM.Income);
                angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(incomedetail) {
                    $scope.checkValIncomeDetail("All", incomedetail);
                });
                angular.forEach($scope.IncomePromotionsVM.ArrIncomePromotion, function(incomepromotion) {
                    $scope.checkValIncomePromotion("All", incomepromotion);
                });
                var isval = false;
                isval = $scope.IncomeVM.Income.valmanager.IsValid;
                if (isval == true && $scope.IncomeDetailsVM.ArrIncomeDetail.length > 0) {
                    angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(item) {
                       if(item.valmanager.IsValid == false&&isval==true){ isval= false; }
                    });
                }
                if (isval == true && $scope.IncomePromotionsVM.ArrIncomePromotion.length > 0) {
                    angular.forEach($scope.IncomeDetailsVM.ArrIncomePromotion, function(item) {
                        if(item.valmanager.IsValid == false&&isval==true){ isval= false; }
                    });
                }
                if (isval == false) {
                    $('.validateinput:first').focus();
                    return false;
                } else {
                    return true;
                }
            };
            $scope.checkValIncome = function(casename, income) {
                if (casename != "All") {
                    //logic for validate form
                    ValIncome(casename, income);
                    //end logic
                } else {
                    income.valmanager.Reset();
                    angular.forEach(income.valmanager.ArrValidateField, function(valfield) {
                        ValIncome(valfield.Name, income);
                    });
                }
            };
            $scope.checkValIncomeDetail = function(casename, incomedetail) {
                if (casename != "All") {
                    //logic for validate form
                    ValIncomeDetail(casename, incomedetail);
                    //end logic
                } else {
                    incomedetail.valmanager.Reset();
                    angular.forEach(incomedetail.valmanager.ArrValidateField, function(valfield) {
                        ValIncomeDetail(valfield.Name, incomedetail);
                    });
                }
            };
            $scope.checkValIncomePromotion = function(casename, incomepromotion) {
                if (casename != "All") {
                    //logic for validate form
                    ValIncomePromotion(casename, incomepromotion);
                    //end logic
                } else {
                    incomepromotion.valmanager.Reset();
                    angular.forEach(incomepromotion.valmanager.ArrValidateField, function(valfield) {
                        ValIncomePromotion(valfield.Name, incomepromotion);
                    });
                }
            };
            function ValIncome(fieldname, item) {
                switch (fieldname) {
                    case "CustomerId":
                        if (item.CustomerId == "" || item.CustomerId == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            if (isNaN(item.CustomerId)) {
                                item.valmanager.Set(fieldname, false, "Invalid");
                            } else {
                                item.valmanager.Set(fieldname, true, "");
                            }
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

                        if ($scope.IncomeDetailsVM.ArrIncomeDetail.length <=0) {
                            item.valmanager.Set(fieldname, false, "You must add atleast 1 item detail.");
                        } else {
                            var deleteitem = $filter("filter")($scope.IncomeDetailsVM.ArrIncomeDetail,{editmode:"Delete"});
                            if($scope.IncomeDetailsVM.ArrIncomeDetail.length==deleteitem.length){
                                item.valmanager.Set(fieldname, false, "You must add at least 1 item detail.");
                            }else {
                                item.valmanager.Set(fieldname, true, "");
                            }
                        }
                        break;
                }
            }
            $scope.onChangeIncome_InvoiceDate = function(income) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncome("InvoiceDate", income);
                }
            };
            $scope.onChangeIncome_CustomerId = function(income) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncome("CustomerId", income);
                }
            };
            function ValIncomeDetail(fieldname, item) {
                switch (fieldname) {

                    case "ProductId":
                        if (item.ProductId == "" || item.ProductId == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "UnitPrice":
                        if (item.UnitPrice!=0&&(item.UnitPrice == "" || item.UnitPrice == null)) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            if (isNaN(item.UnitPrice) || item.UnitPrice < 0) {
                                item.valmanager.Set(fieldname, false, "Invalid");
                            } else {
                                item.valmanager.Set(fieldname, true, "");
                            }
                        }
                        break;
                    case "Quantity":
                        if (item.Quantity!=0 &&(item.Quantity == "" || item.Quantity == null)) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            if (isNaN(item.Quantity) || item.Quantity <= 0) {
                                item.valmanager.Set(fieldname, false, "Invalid");
                            } else {
                                item.valmanager.Set(fieldname, true, "");
                            }
                        }
                        break;
                    case "Discount":
                        if (item.Discount!=0 && (item.Discount == "" || item.Discount == null)) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            if (isNaN(item.Discount) || item.Discount < 0) {
                                item.valmanager.Set(fieldname, false, "Invalid");
                            } else {
                                item.valmanager.Set(fieldname, true, "");
                            }
                        }
                        break;
                }
            }


            $scope.onChangeIncomeDetail_Quantity = function(incomedetail) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncomeDetail("Quantity", incomedetail);
                }
                RecalIncome();
                RecalIncomeDetail();
            };
            $scope.onChangeIncomeDetail_UnitPrice = function(incomedetail) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncomeDetail("UnitPrice", incomedetail);
                }
                RecalIncome();
                RecalIncomeDetail();
            };
            $scope.onChangeIncomeDetail_Discount = function(incomedetail) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncomeDetail("Discount", incomedetail);
                }
                RecalIncome();
                RecalIncomeDetail();
            };

            function RecalIncome() {
                var total = 0;
                angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(detail) {
                    if(detail.editmode!="Delete") {
                        total += parseFloat(detail.Quantity) * parseFloat(detail.UnitPrice) - (parseFloat(detail.Quantity) * parseFloat(detail.UnitPrice) * parseFloat(detail.Discount) / 100);
                    }
                });
                $scope.IncomeVM.Income.Amount = total;
            }
            function RecalIncomeDetail() {
                angular.forEach($scope.IncomeDetailsVM.ArrIncomeDetail, function(detail) {
                    detail.Total = parseFloat(detail.Quantity) * parseFloat(detail.UnitPrice) - (parseFloat(detail.Quantity) * parseFloat(detail.UnitPrice) * parseFloat(detail.Discount) / 100);
                });
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

            $scope.onChangeIncomePromotion_PromotionName = function(incomepromotion) {

                if ($scope.Processing.Completed == 100) {
                    $scope.checkValIncomePromotion("PromotionName", incomepromotion);
                    var promotion = $filter('filter')($scope.PromotionsVM.ArrPromotion, {Name: incomepromotion.PromotionName})[0];
                    if (promotion != null) {
                        incomepromotion.PromotionDescription = promotion.Description;
                    }
                }
            };

            $scope.startAddPopupIncomeDetail = function() {
                $scope.SearchProductsVM.SetSearchParam("Type", "");
                $scope.SearchProductsVM.SetSearchParam("Name", "");
                $scope.SearchProductsVM.SetSearchParam("CategoryId", "");
                $scope.SearchProductsVM.InitData();
                $("#popupProduct").modal("show");
                $('#myTab a:first').tab('show');
            };
            $scope.finishAddPopupProduct = function(){
                angular.forEach($scope.SearchProductsVM.ArrSProduct,function(p){
                    var d = new IncomeDetail(0,0, p.Id,1, p.UnitPrice,0,"");
                    d.guid = p.guid;
                    d.ProductName = p.Name;
                    d.editmode = "New";
                    $scope.IncomeDetailsVM.ArrIncomeDetail.push(d);
                    $scope.IncomeDetailsVM.startEditListIncomeDetail(d);
                });
                RecalIncome();
                RecalIncomeDetail();
                $scope.SearchProductsVM.ArrSProduct = new Array();
                $("#popupProduct").modal("hide");
            };
            $scope.selectProduct = function(item){
                var item1 = angular.copy(item);
                $scope.SearchProductsVM.ArrSProduct.push(item1);
            };
            $scope.unselectProduct = function(item){
                $scope.SearchProductsVM.ArrSProduct.splice($scope.SearchProductsVM.ArrSProduct.indexOf(item),1);
            };
            $scope.InitData();
        };

        return new DetailIncomeController();
    }
})(angular);
