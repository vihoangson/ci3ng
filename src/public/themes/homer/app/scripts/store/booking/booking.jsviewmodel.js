var BookingsViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "booking/getinit",
        getBookings: $http.defaults.route + "booking/getmany",
        saveBooking: $http.defaults.route + "booking/save",
        removeBooking: $http.defaults.route + "booking/remove",
        saveListBooking: $http.defaults.route + "booking/savelist"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFSaveAll = null;
    self.FFDelete = null;
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.NumItemSave = 5;
    self.ArrSBooking = new Array();
    self.ArrBooking = new Array();
    //------- Init data for view model----------------------------
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
    self.SetFFSaveAll = function (ffsaveall) {
        self.FFSaveAll = ffsaveall;
    };

    self.InitData = function () {
        InitBookings();
    };
    //--------------- For Searching -----------------------------//
    self.searchBookings = function () {
        InitBookings();
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddBooking = function () {
        self.Processing.SetProcessing("Bookings", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewBooking(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditBooking = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditBooking = function (item) {
        SaveBooking(item);
    };
    self.cancelEditBooking = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrBooking.splice(self.ArrBooking.indexOf(item), 1);
        } else {
            ResetBooking(item);
            item.isedit = false;
        }
    }
    self.removeBooking = function (item) {
        DeleteBooking(item);
    };
    self.startSort = function (field) {
        if (self.SortedField != null) {
            if (self.SortedField.Name == field) {
                self.SortedField.Direction = !self.SortedField.Direction;
            } else {
                self.SortedField.Name = field;
                self.SortedField.Direction = false;
            }
        } else {
            self.SortedField = new SortField(field, false);
        }
        InitBookings();
    };
    //--------------- Action Function ----------//
    function FinishInitNewBooking(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToBooking(data.booking);
            item.guid = data.booking.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
            self.ArrBooking.push(item);
        }
        self.Processing.SetProcessing("Bookings", false);
    }
    function InitBookings() {
        self.Processing.SetProcessing("Bookings", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getBookings, json).
           success(function (data, status, headers, config) {
               FinishInitBookings(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitBookings(data) {
        if (data.result == "Success") {
            self.ArrBooking = new Array();
            angular.forEach(data.bookings, function (item) {
                self.ArrBooking.push(self.ConvertDataToBooking(item));
            });
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Bookings", false);
    }
    function SaveBooking(item) {
        if (ValidateBooking(item)) {
            self.Processing.SetProcessing("Bookings", true);
            var json = JSON.stringify(ConvertBookingToPostObject(item));
            $http.post(self.GetUrl.saveBooking, json).
             success(function (data, status, headers, config) {
                 FinishSaveBooking(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveBooking(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrBooking, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrBooking, { guid: data.guid })[0];
            }
            if (item != null) {
                item.Id = data.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Bookings", false);
    }
    function DeleteBooking(item) {
            swal({
                title: "Delete?",
                text: "Do you want to delete this item.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes"
            }, function (isConfirm) {
                if (isConfirm) {
                       if (item != undefined) {
                           if (item.Id == null || item.Id == 0) {
                               self.ArrBooking.splice(self.ArrBooking.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Bookings", true);
                           $http.post(self.GetUrl.removeBooking, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrBooking, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrBooking.splice(self.ArrBooking.indexOf(item), 1);
                                     }
                                 }
                                 else {
                                      swal({
                                          title: "Error?",
                                          text: "Delete fail.",
                                          type: "error",
                                          showCancelButton: false
                                      });
                                 }
                                 if (self.FFDelete != null) self.FFDelete();
                                 self.Processing.SetProcessing("Bookings", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Bookings", false);
                          });
                       }
                   }
               });
    }
    function ConvertBookingToPostObject(item) {
        var postObject = {
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
               postObject.RequiredAt = parseJsonDateS(item.RequiredAt);
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
    function SetGetParam() {
        var postParam = {
            searchparams: null
        };
        if (self.SortedField != null) {
            var sparam = $filter('filter')(self.ArrSearchParam, { Key: "SortedField" })[0];
            if (sparam != null) {
                sparam.Value = self.SortedField.Name;
                var sparam1 = $filter('filter')(self.ArrSearchParam, { Key: "SortedDirection" })[0];
                sparam1.Value = self.SortedField.Direction;
            } else {
                self.ArrSearchParam.push(new SearchParam("SortedField", self.SortedField.Name));
                self.ArrSearchParam.push(new SearchParam("SortedDirection", self.SortedField.Direction));
            }
        }
        if (self.ArrSearchParam.length > 0) {
            postParam.searchparams = angular.copy(self.ArrSearchParam);
        }
        return postParam;
    }
    function ValidateBooking(item) {
        return true;
    }
    self.GetSearchParam = function (key) {
        var param = $filter('filter')(self.ArrSearchParam, { Key: key })[0];
        if (param == null) {
            param = new SearchParam(key, null);
            self.ArrSearchParam.push(param);
        }
        return param;
    };
    self.SetSearchParam = function (key, value) {
        var param = $filter('filter')(self.ArrSearchParam, { Key: key })[0];
        if (param == null) {
            param = new SearchParam(key, value);
            self.ArrSearchParam.push(param);
        } else { param.Value = value; }
    };

    self.startAddListBooking = function () {
        self.Processing.SetProcessing("Bookings", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewBooking(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListBooking = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListBooking = function (item) {
        if (ValidateBooking(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListBooking = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetBooking(item);
        item.isedit(false);
    };
    self.removeListBooking = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrBooking.splice(self.ArrBooking.indexOf(item), 1);
        } else {
            bootbox.dialog({
                message: "<b>Do you want to delete the item?</b>",
                buttons: {
                    success: {
                        label: "Yes", className: "btn-primary", callback: function () {
                            item.editmode = "Delete";
                        }
                    },
                    danger: {
                        label: "No", className: "btn-danger", callback: function () {
                            return;
                        }
                    }
                }
            });
        }
    };
    self.saveAllBooking = function () {
        SaveListBooking();
    };
    function FinishInitListNewBooking(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToBooking(data.booking);
            item.guid = data.booking.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrBooking.push(item);
        }
        self.Processing.SetProcessing("Bookings", false);
    }
    function SaveListBooking() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSBooking.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrBooking.length && numsave > 0; i++) {
            var item = self.ArrBooking[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidateBooking(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSBooking.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Bookings", true);
            var json = JSON.stringify({bookings:postArray});
            $http.post(self.GetUrl.saveListBooking, json).
             success(function (data, status, headers, config) {
                 FinishSaveListBooking(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListBooking(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSBooking, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.bookings, { guid: data.guid })[0];
                    if (dataItem != null) {
                        item.Id = dataItem.Id;
                    }
                }
                if (item.editmode != "Delete") {
                    item.editmode = "";
                }
                item.isedit = false;
            });
        }
        if (self.ArrBooking.length == self.ArrSBooking.length) {
            self.Processing.SetProcessing("Bookings", false);
            self.ArrSBooking = new Array();
            angular.forEach(self.ArrSBooking, function (item) {
                if (item.editmode == "Delete") {
                    self.ArrBooking.splice(self.ArrBooking.indexOf(item), 1);
                }
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListBooking();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
