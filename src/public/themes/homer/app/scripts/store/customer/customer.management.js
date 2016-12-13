(function(angular) {
    angular
        .module("homer")
        .controller("ManagementCustomerController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function ManagementCustomerController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        ManagementCustomerController.prototype = Object.create(AbstractController.prototype);
        ManagementCustomerController.prototype.constructor = ManagementCustomerController;

        ManagementCustomerController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.CustomersVM = null;
            $scope.CustomerVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var customersvm = $injector.instantiate(CustomersPageViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;

                var customervm = $injector.instantiate(CustomerViewModel);
                customervm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomerVM = customervm;

                //set view model relation
                //int main view model

                $scope.CustomersVM.InitData();
            };
            $scope.removeCustomer = function (item) {
                $scope.CustomersVM.removeCustomer(item);
            };
            $scope.checkValCustomer = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValCustomer(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValCustomer(valfield.Name, item);
                    });
                }
            }
            function ValCustomer(fieldname, item) {
                switch (fieldname) {
                    case "Title":
                        if (item.Title == "" || item.Title == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "FirstName":
                        if (item.FirstName == "" || item.FirstName == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "LastName":
                        if (item.LastName == "" || item.LastName == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "Email":
                        if (item.Email == "" || item.Email == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "Mobile":
                        if (item.Mobile == "" || item.Mobile == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                }
            }
            $scope.onChangeCustomer_Title = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("Title", item);
                }
            };
            $scope.onChangeCustomer_FirstName = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("FirstName", item);
                }
            };
            $scope.onChangeCustomer_LastName = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("LastName", item);
                }
            };
            $scope.onChangeCustomer_Email = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("Email", item);
                }
            };
            $scope.onChangeCustomer_Mobile = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("Mobile", item);
                }
            };
            $scope.checkEditingCustomer = function () {
                var isedit = false;
                angular.forEach($scope.CustomersVM.ArrCustomer, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingCustomer()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupCustomer = function (item) {
                $scope.CustomerVM.Customer = null;
                $scope.CustomerVM.SetId(0);

                $scope.CustomerVM.SetFFInit(function() {
                    $('#popupCustomer').on('hide.bs.modal', function () {
                        if ($scope.CustomerVM.Customer.isedit == true) {
                            $scope.CustomerVM.Customer.isedit = false;
                            $scope.CustomerVM.cancelEditCustomer($scope.CustomerVM.Customer);
                        }
                    });
                    $("#popupCustomer").modal("show");
                });
                $scope.CustomerVM.InitData();
            };
            $scope.startEditPopupCustomer = function (item) {
                $scope.CustomerVM.Customer = item;
                $scope.CustomerVM.startEditCustomer($scope.CustomerVM.Customer);
                $('#popupCustomer').on('hide.bs.modal', function () {
                    if ($scope.CustomerVM.Customer.isedit == true) {
                        $scope.CustomerVM.cancelEditCustomer($scope.CustomerVM.Customer);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupCustomer").modal("show");
            };
            $scope.finishEditPopupCustomer = function () {
                $scope.checkValCustomer("All", $scope.CustomerVM.Customer);
                if ($scope.CustomerVM.Customer.valmanager.IsValid) {
                    $scope.CustomerVM.SetFFSave(function () {
                        $scope.CustomerVM.Customer.DobF = parseDateDisplay($scope.CustomerVM.Customer.Dob);
                        var item = $filter('filter')($scope.CustomersVM.ArrCustomer, { Id: $scope.CustomerVM.Customer.Id })[0];
                        if(item==null){
                            $scope.CustomersVM.ArrCustomer.push($scope.CustomerVM.Customer);
                            $scope.CustomersVM.Paging.TotalItems +=1;
                        }
                        $("#popupCustomer").modal("hide");
                    });
                    $scope.CustomerVM.finishEditCustomer($scope.CustomerVM.Customer);
                } else {
                    $('.validateinput:first').focus();
                }
            };


            $scope.InitData();
        };

        return new ManagementCustomerController();
    }
})(angular);
