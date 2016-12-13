var BookingViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getBooking: $http.defaults.route + "booking/getbyid",
        saveBooking: $http.defaults.route + "booking/save",
        removeBooking: $http.defaults.route + "booking/remove",
        getInit: $http.defaults.route + "booking/getinit"
    };
    self.Id = null;
    self.Booking = null;
    self.Transition = null;
    self.Processing = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.SetFFInit = function (ffinit) {
        self.FFInit = ffinit;
    };
    self.SetFFSave = function (ffsave) {
        self.FFSave = ffsave;
    };
    self.SetFFDelete = function (ffdelete) {
        self.FFDelete = ffdelete;
    };
    self.SetId = function (id) {
        self.Id = id;
    };
    self.InitData = function () {
        InitBooking();
    };
    self.startEditBooking = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditBooking = function (item) {
        SaveBooking(item);
    };
    self.cancelEditBooking = function (item) {
        ResetBooking(item);
        item.isedit = false;
    };
    self.removeBooking = function (item) {
        DeleteBooking(item);
    };
    function InitBooking() {
        self.Processing.SetProcessing("Booking", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getBooking, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitBooking(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewBooking(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitBooking(data) {
        if (data.result == "Success") {
            self.Booking = self.ConvertDataToBooking(data.booking);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Booking", false);
    }
    function FinishInitNewBooking(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToBooking(data.booking);
            item.guid = data.booking.guid;
            self.Booking = item;
            self.Booking.allowedit = true;
            self.Booking.allowremove = true;
            self.Booking.oldvalue = angular.copy(self.Booking);
            self.Booking.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Booking", false);
    }
    function SaveBooking(item) {
        if (ValidateBooking(item)) {
            self.Processing.SetProcessing("Booking", true);
            var json = JSON.stringify(ConvertBookingToPostObject(item));
            $http.post(self.GetUrl.saveBooking, json).
             success(function (data, status, headers, config) {
                 FinishSaveBooking(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateBooking(item) {
        return true;
    }
    function FinishSaveBooking(data) {
        if (data.result == "Success") {
            self.Booking.Id = data.booking.Id;
            self.Id = data.booking.Id;
            self.Booking.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Booking", false);
    }
    function DeleteBooking(item) {
        self.Processing.SetProcessing("Booking", true);
            swal({
                title: "Delete?",
                text: "Do you want to delete this item.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes"
            }, function (isConfirm) {
                if (isConfirm) {
                    if (item != null) {
                        $http.post(self.GetUrl.removeBooking, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Booking", false);
                            if (data.result == "Success") {
                            } else {
                               swal({
                                   title: "Error?",
                                   text: "Save fail.",
                                   type: "error",
                                   showCancelButton: false
                               });
                            }
                            if (self.FFDelete != null) self.FFDelete();
                        }).
                         error(function (data, status, headers, config) {
                             self.Processing.SetProcessing("Booking", false);
                         });
                    }
                }
            });
    }
    function ConvertBookingToPostObject(item) {
        var postObject = {
						  SendEmail : true,	
                          Id: item.Id,
                          CustomerId: item.CustomerId,
                          Service: item.Service,
                          Note: item.Note,
                          Status: item.Status,
                          RequiredAt: item.RequiredAt,
                          CustomerName: item.CustomerName,
                          CustomerPhone: item.CustomerPhone,
                          guid: item.guid
                         };
           if(item.RequiredAt!==null)
           {
               postObject.RequiredAt = parseJsonDateS(item.RequiredAt)+ " "+ parseJsonTimeS(item.RequiredAtTime);
           }
        return postObject;
    }
    function ResetBooking(item) {
        item.Id = item.oldvalue.Id;
        item.CustomerId = item.oldvalue.CustomerId;
        item.Service = item.oldvalue.Service;
        item.Note = item.oldvalue.Note;
        item.Status = item.oldvalue.Status;
        item.RequiredAt = item.oldvalue.RequiredAt;
        item.CustomerName = item.oldvalue.CustomerName;
        item.CustomerPhone = item.oldvalue.CustomerPhone;
    }
    self.ConvertDataToBooking = function (dataItem) {
        var item = new Booking(
                              dataItem.Id,
                              dataItem.CustomerId,
                              dataItem.Service,
                              dataItem.Note,
                              dataItem.Status,
                              dataItem.RequiredAt,
                              dataItem.CustomerName,
                              dataItem.CustomerPhone
                            );
        if(dataItem.Customer!=null) {
            if(dataItem.CustomerId>1) {
                if (dataItem.Customer.Title != null) {
                    item.CustomerName = dataItem.Customer.Title + ". " + dataItem.Customer.FullName;
                } else {
                    item.CustomerName = dataItem.Customer.FullName;
                }
                item.CustomerPhone = dataItem.Customer.Mobile;
            }
        }
        return item;
    };
};
