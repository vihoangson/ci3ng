(function(angular) {
    angular
        .module("homer")
        .controller("CalendarController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function CalendarController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        CalendarController.prototype = Object.create(AbstractController.prototype);
        CalendarController.prototype.constructor = CalendarController;

        CalendarController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.BookingsVM = null;
            $scope.BookingVM = null;
            $scope.CustomersVM = null;
            $scope.DisplayDate = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var bookingsvm = $injector.instantiate(BookingsPageViewModel);
                bookingsvm.InitModel($scope.Transition, $scope.Processing);
                $scope.BookingsVM = bookingsvm;

                var bookingvm = $injector.instantiate(BookingViewModel);
                bookingvm.InitModel($scope.Transition, $scope.Processing);
                $scope.BookingVM = bookingvm;

                var customersvm = $injector.instantiate(CustomersViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;
                $scope.CustomersVM.InitData();
                //set view model relation
                //int main view model

                $scope.DisplayDate = parseDateDisplay(new Date());
                $scope.BookingsVM.SetSearchParam("RequiredAt",parseJsonDateS(new Date()));
                $scope.BookingsVM.SortedField = new SortField("RequiredAt",true);
                $scope.BookingsVM.InitData();

            };
            $scope.removeBooking = function (item) {
                $scope.BookingsVM.removeBooking(item);
            };
            $scope.checkValBooking = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValBooking(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValBooking(valfield.Name, item);
                    });
                }
            }
            function ValBooking(fieldname, item) {
                switch (fieldname) {
                    case "CustomerId":
                        if (item.CustomerId == "" || item.CustomerId == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "Service":
                        if (item.Service == "" || item.Service == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;

                    case "Status":
                        if (item.Status == "" || item.Status == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                    case "RequiredAt":
                        if (item.RequiredAt == "" || item.RequiredAt == null) {
                            item.valmanager.Set(fieldname, false, "*");
                        } else {
                            item.valmanager.Set(fieldname, true, "");
                        }
                        break;
                }
            }
            $scope.onChangeBooking_CustomerId = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("CustomerId", item);
                }
            };
            $scope.onChangeBooking_Service = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("Service", item);
                }
            };
            $scope.onChangeBooking_Note = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("Note", item);
                }
            };
            $scope.onChangeBooking_Status = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("Status", item);
                }
            };
            $scope.onChangeBooking_RequiredAt = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("RequiredAt", item);
                }
            };
            $scope.checkEditingBooking = function () {
                var isedit = false;
                angular.forEach($scope.BookingsVM.ArrBooking, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingBooking()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupBooking = function (item) {
                $scope.BookingVM.Booking = null;
                $scope.BookingVM.SetId(0);

                $scope.BookingVM.SetFFInit(function() {
                    $('#popupBooking').on('hide.bs.modal', function () {
                        if ($scope.BookingVM.Booking.isedit == true) {
                            $scope.BookingVM.Booking.isedit = false;
                            $scope.BookingVM.cancelEditBooking($scope.BookingVM.Booking);
                        }
                    });
                    $("#popupBooking").modal("show");
                });
                $scope.BookingVM.InitData();
            };
            $scope.startEditPopupBooking = function (item) {
                $scope.BookingVM.Booking = item;
                $scope.BookingVM.startEditBooking($scope.BookingVM.Booking);
                $('#popupBooking').on('hide.bs.modal', function () {
                    if ($scope.BookingVM.Booking.isedit == true) {
                        $scope.BookingVM.cancelEditBooking($scope.BookingVM.Booking);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupBooking").modal("show");
            };
            $scope.finishEditPopupBooking = function () {
                $scope.checkValBooking("All", $scope.BookingVM.Booking);
                if ($scope.BookingVM.Booking.valmanager.IsValid) {
                    $scope.BookingVM.SetFFSave(function () {
                        $scope.BookingVM.Booking.RequiredAtF = parseDateDisplay($scope.BookingVM.Booking.RequiredAt);
                        var item = $filter('filter')($scope.BookingsVM.ArrBooking, { Id: $scope.BookingVM.Booking.Id })[0];
                        if(item==null){
                            $scope.BookingsVM.ArrBooking.unshift($scope.BookingVM.Booking);
                            $scope.BookingsVM.Paging.TotalItems +=1;
                        }
                        $scope.BookingVM.Booking.RequiredAtTimeF = parseJsonTimeS($scope.BookingVM.Booking.RequiredAtTime);
                        $scope.BookingVM.Booking.RequiredAtF = parseDateDisplay($scope.BookingVM.Booking.RequiredAt);
                        var customer = $filter('filter')($scope.CustomersVM.ArrCustomer, {Id: $scope.BookingVM.Booking.CustomerId})[0];
                        if (customer != null) {
                            $scope.BookingVM.Booking.CustomerName = customer.DisplayName;
                        } else {
                            $scope.BookingVM.Booking.CustomerName = "";
                        }
                        if(!$scope.$$phase) { $scope.$apply();}
                        $("#popupBooking").modal("hide");
                    });
                    $scope.BookingVM.finishEditBooking($scope.BookingVM.Booking);
                } else {
                    $('.validateinput:first').focus();
                }
            };


            $scope.InitData();
        };

        return new CalendarController();
    }
})(angular);
