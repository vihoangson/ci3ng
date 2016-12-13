var CustomersViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "customer/getinit",
        getCustomers: $http.defaults.route + "customer/getmany",
        saveCustomer: $http.defaults.route + "customer/save",
        removeCustomer: $http.defaults.route + "customer/remove",
        saveListCustomer: $http.defaults.route + "customer/savelist"
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
    self.ArrSCustomer = new Array();
    self.ArrCustomer = new Array();
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
        InitCustomers();
    };
    //--------------- For Searching -----------------------------//
    self.searchCustomers = function () {
        InitCustomers();
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddCustomer = function () {
        self.Processing.SetProcessing("Customers", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewCustomer(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditCustomer = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditCustomer = function (item) {
        SaveCustomer(item);
    };
    self.cancelEditCustomer = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrCustomer.splice(self.ArrCustomer.indexOf(item), 1);
        } else {
            ResetCustomer(item);
            item.isedit = false;
        }
    }
    self.removeCustomer = function (item) {
        DeleteCustomer(item);
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
        InitCustomers();
    };
    //--------------- Action Function ----------//
    function FinishInitNewCustomer(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToCustomer(data.customer);
            item.guid = data.customer.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
            self.ArrCustomer.push(item);
        }
        self.Processing.SetProcessing("Customers", false);
    }
    function InitCustomers() {
        self.Processing.SetProcessing("Customers", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getCustomers, json).
           success(function (data, status, headers, config) {
               FinishInitCustomers(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitCustomers(data) {
        if (data.result == "Success") {
            self.ArrCustomer = new Array();
            angular.forEach(data.customers, function (item) {
                self.ArrCustomer.push(self.ConvertDataToCustomer(item));
            });
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Customers", false);
    }
    function SaveCustomer(item) {
        if (ValidateCustomer(item)) {
            self.Processing.SetProcessing("Customers", true);
            var json = JSON.stringify(ConvertCustomerToPostObject(item));
            $http.post(self.GetUrl.saveCustomer, json).
             success(function (data, status, headers, config) {
                 FinishSaveCustomer(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveCustomer(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrCustomer, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrCustomer, { guid: data.guid })[0];
            }
            if (item != null) {
                item.Id = data.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Customers", false);
    }
    function DeleteCustomer(item) {
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
                               self.ArrCustomer.splice(self.ArrCustomer.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Customers", true);
                           $http.post(self.GetUrl.removeCustomer, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrCustomer, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrCustomer.splice(self.ArrCustomer.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("Customers", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Customers", false);
                          });
                       }
                   }
               });
    }
    function ConvertCustomerToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          Title: item.Title,
                          FirstName: item.FirstName,
                          LastName: item.LastName,
                          FullName: item.FullName,
                          Gender: item.Gender,
                          Dob: item.Dob,
                          Age: item.Age,
                          PostalCode: item.PostalCode,
                          Email: item.Email,
                          Mobile: item.Mobile,
                          Nric: item.Nric,
                          AddressLine1: item.AddressLine1,
                          IsLoyal: item.IsLoyal,
                          guid: item.guid
                         };
           if(item.Dob!==null)
           {
               postObject.Dob = parseJsonDateS(item.Dob);
           }
        return postObject;
    }
    function ResetCustomer(item) {
        item.Id = item.oldvalue.Id;
        item.Title = item.oldvalue.Title;
        item.FirstName = item.oldvalue.FirstName;
        item.LastName = item.oldvalue.LastName;
        item.FullName = item.oldvalue.FullName;
        item.Gender = item.oldvalue.Gender;
        item.Dob = item.oldvalue.Dob;
        item.Age = item.oldvalue.Age;
        item.PostalCode = item.oldvalue.PostalCode;
        item.Email = item.oldvalue.Email;
        item.Mobile = item.oldvalue.Mobile;
        item.Nric = item.oldvalue.Nric;
        item.AddressLine1 = item.oldvalue.AddressLine1;
        item.IsLoyal = item.oldvalue.IsLoyal;
    }
    self.ConvertDataToCustomer = function (dataItem) {
        var item = new Customer(
                              dataItem.Id,
                              dataItem.Title,
                              dataItem.FirstName,
                              dataItem.LastName,
                              dataItem.FullName,
                              dataItem.Gender,
                              dataItem.Dob,
                              dataItem.Age,
                              dataItem.PostalCode,
                              dataItem.Email,
                              dataItem.Mobile,
                              dataItem.Nric,
                              dataItem.AddressLine1,
                              dataItem.IsLoyal
                            );
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
    function ValidateCustomer(item) {
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

    self.startAddListCustomer = function () {
        self.Processing.SetProcessing("Customers", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewCustomer(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListCustomer = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListCustomer = function (item) {
        if (ValidateCustomer(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListCustomer = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetCustomer(item);
        item.isedit(false);
    }
    self.removeListCustomer = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrCustomer.splice(self.ArrCustomer.indexOf(item), 1);
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
    self.saveAllCustomer = function () {
        SaveListCustomer();
    };
    function FinishInitListNewCustomer(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToCustomer(data.customer);
            item.guid = data.customer.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrCustomer.push(item);
        }
        self.Processing.SetProcessing("Customers", false);
    }
    function SaveListCustomer() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSCustomer.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrCustomer.length && numsave > 0; i++) {
            var item = self.ArrCustomer[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidateCustomer(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSCustomer.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Customers", true);
            var json = JSON.stringify({customers:postArray});
            $http.post(self.GetUrl.saveListCustomer, json).
             success(function (data, status, headers, config) {
                 FinishSaveListCustomer(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListCustomer(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSCustomer, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.customers, { guid: data.guid })[0];
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
        if (self.ArrCustomer.length == self.ArrSCustomer.length) {
            self.Processing.SetProcessing("Customers", false);
            self.ArrSCustomer = new Array();
            angular.forEach(self.ArrSCustomer, function (item) {
                if (item.editmode == "Delete") {
                    self.ArrCustomer.splice(self.ArrCustomer.indexOf(item), 1);
                }
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListCustomer();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
