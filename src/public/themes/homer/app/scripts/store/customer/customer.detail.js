(function(angular) {
    angular.module("homer").controller("DetailCustomerController", Anonymous);
    function Anonymous($scope, AbstractController, $injector, $filter, $http,Upload, $stateParams) {
        function DetailCustomerController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }

        DetailCustomerController.prototype = Object.create(AbstractController.prototype);
        DetailCustomerController.prototype.constructor = DetailCustomerController;

        DetailCustomerController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.CustomerVM = null;
            $scope.IncomesVM = null;
            $scope.MediasVM = null;
            $scope.InitData = function() {
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var customervm = $injector.instantiate(CustomerViewModel);
                customervm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomerVM = customervm;

                var incomesvm = $injector.instantiate(IncomesPageViewModel);
                incomesvm.InitModel($scope.Transition, $scope.Processing);
                $scope.IncomesVM = incomesvm;

                var mediasvm = $injector.instantiate(MediasPageViewModel);
                mediasvm.InitModel($scope.Transition, $scope.Processing);
                $scope.MediasVM = mediasvm;
                //init and load data for view model
                $scope.CustomerVM.SetFFInit(function() {
                    if($scope.CustomerVM.Id>0){
                        $scope.IncomesVM.SetSearchParam("CustomerId",$scope.CustomerVM.Id);
                        $scope.IncomesVM.InitData();
                        $scope.MediasVM.SetSearchParam("CustomerId",$scope.CustomerVM.Id);
                        $scope.MediasVM.InitData();
                    }
                });
                var id = $stateParams.id;
                if (id == null) {
                    id = 0;
                } else {
                    id = parseInt(id);
                }
                $scope.CustomerVM.SetId(id);
                $scope.CustomerVM.InitData();
            };
            $scope.startEditCustomer = function() {
                $scope.CustomerVM.startEditCustomer($scope.CustomerVM.Customer);
            };
            $scope.finishEditCustomer = function() {
                if ($scope.validateViewModel()) {
                    $scope.CustomerVM.SetFFSave(function() {
                        $scope.CustomerVM.Customer.DobF = parseDateDisplay( $scope.CustomerVM.Customer.Dob);
                    });
                    $scope.CustomerVM.finishEditCustomer($scope.CustomerVM.Customer);
                }
            };
            $scope.cancelEditCustomer = function() {
                $scope.CustomerVM.Customer.valmanager.Reset();
                $scope.CustomerVM.cancelEditCustomer($scope.CustomerVM.Customer);
            };
            $scope.checkEditingCustomer = function() {
                var isediting = false;
                isediting = $scope.CustomerVM.Customer != null && $scope.CustomerVM.Customer.isedit;
                return isediting;
            };
            window.onbeforeunload = function() {
                if ($scope.checkEditingCustomer) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.validateViewModel = function() {
                $scope.checkValCustomer("All", $scope.CustomerVM.Customer);
                var isval = false;
                isval = $scope.CustomerVM.Customer.valmanager.IsValid;
                if (isval == false) {
                    $('.validateinput:first').focus();
                    return false;
                } else {
                    return true;
                }
            };
            $scope.checkValCustomer = function(casename, customer) {
                if (casename != "All") {
                    //logic for validate form
                    ValCustomer(casename, customer);
                    //end logic
                } else {
                    customer.valmanager.Reset();
                    angular.forEach(customer.valmanager.ArrValidateField, function(valfield) {
                        ValCustomer(valfield.Name, customer);
                    });
                }
            };
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
                    case "Dob":
                        if (item.Dob == "" || item.Dob == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                }
            }

            $scope.onChangeCustomer_Title = function(customer) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("Title", customer);
                }
            };
            $scope.onChangeCustomer_FirstName = function(customer) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("FirstName", customer);
                    customer.FullName = customer.FirstName + " " + customer.LastName;
                }
            };
            $scope.onChangeCustomer_LastName = function(customer) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("LastName", customer);
                    customer.FullName = customer.FirstName + " " + customer.LastName;
                }
            };
            $scope.onChangeCustomer_Dob = function(customer) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValCustomer("Dob", customer);
                }
            };
            $scope.upload = function (files) {
                var uploadurl = $http.defaults.route + "media";
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        Upload.upload({
                            url: uploadurl,
                            fields: {'CustomerId': $scope.CustomerVM.Id},
                            file: file
                        }).progress(function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                           // console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                        }).success(function (data, status, headers, config) {
                            //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                            FinishUploadData(data.data);
                        });
                    }
                }
            };
            function FinishUploadData(data){
               if(data!=null){
                   var media = new Media(data.Id,$scope.CustomerVM.Id,data.OriginName,data.FileName,data.FileExt,data.FileType,data.FileSize,data.FilePath,data.FileUrl);
                   $scope.MediasVM.ArrMedia.unshift(media);
                   if(!$scope.$$phase) { $scope.$apply();}
               }
            }
            $scope.InitData();
        };

        return new DetailCustomerController();
    }
})(angular);
