(function(angular) {
angular
    .module("homer")
    .controller("RegisterBookingController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function RegisterBookingController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        RegisterBookingController.prototype = Object.create(AbstractController.prototype);
        RegisterBookingController.prototype.constructor = RegisterBookingController;

        RegisterBookingController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.BookingVM = null;
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

                //set view model relation
                //int main view model
                $scope.BookingVM.SetFFInit(function(){
                    $scope.BookingVM.Booking.Service ='Contact Us Booking';
                    var dateTime = moment();

                    var dateValue = moment({
                        hour:12,
                        minute:0
                    }).toDate();
                    $scope.BookingVM.Booking.RequiredAtTime = dateValue;
                });
                $scope.BookingVM.InitData();
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
            };
            function ValBooking(fieldname, item) {
                switch (fieldname) {
                 case "CustomerName":
                    if (item.CustomerName == "" || item.CustomerName == null) {
                        item.valmanager.Set(fieldname, false, "Please enter your name.");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                case "CustomerPhone":
                    if (item.CustomerPhone == "" || item.CustomerPhone == null) {
                        item.valmanager.Set(fieldname, false, "Please enter your phone.");
                    } else {
                        item.valmanager.Set(fieldname, true, "");
                    }
                    break;
                case "Note":
                        if (item.Note == "" || item.Note == null) {
                            item.valmanager.Set(fieldname, false, "Please enter your contact content.");
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
            $scope.onChangeBooking_CustomerName = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("CustomerName", item);
                }
            };
            $scope.onChangeBooking_CustomerPhone = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("CustomerPhone", item);
                }
            };
            $scope.onChangeBooking_Note = function (item) {
                if ($scope.Processing.Completed == 100) {
                    $scope.checkValBooking("Note", item);
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
            $scope.finishEditBooking = function () {
                $scope.checkValBooking("All", $scope.BookingVM.Booking);
                if ($scope.BookingVM.Booking.valmanager.IsValid) {
                    $scope.BookingVM.SetFFSave(function () {
                        swal({
                            title: "Booking Complete!",
                            text: "Thank for your booking!",
                            type: "success",
                            showCancelButton: false
                        });
                        $scope.BookingVM.Id= 0;
                        $scope.BookingVM.InitData();
                    });
                    $scope.BookingVM.finishEditBooking($scope.BookingVM.Booking);
                } else {
                    swal({
                        title: "Booking Error!",
                        text: "Please input required field!",
                        type: "warning",
                        showCancelButton: false
                    });
                    $('.validateinput:first').focus();
                }
            };

            $scope.InitData();
        };

        return new RegisterBookingController();
    }
})(angular);
