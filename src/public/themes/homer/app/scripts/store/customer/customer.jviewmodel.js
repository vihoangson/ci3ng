var CustomerViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getCustomer: $http.defaults.route + "customer/getbyid",
        saveCustomer: $http.defaults.route + "customer/save",
        removeCustomer: $http.defaults.route + "customer/remove",
        getInit: $http.defaults.route + "customer/getinit"
    };
    self.Id = null;
    self.Customer = null;
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
        InitCustomer();
    };
    self.startEditCustomer = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditCustomer = function (item) {
        SaveCustomer(item);
    };
    self.cancelEditCustomer = function (item) {
        ResetCustomer(item);
        item.isedit = false;
    };
    self.removeCustomer = function (item) {
        DeleteCustomer(item);
    };
    function InitCustomer() {
        self.Processing.SetProcessing("Customer", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getCustomer, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitCustomer(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewCustomer(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitCustomer(data) {
        if (data.result == "Success") {
            self.Customer = self.ConvertDataToCustomer(data.customer);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Customer", false);
    }
    function FinishInitNewCustomer(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToCustomer(data.customer);
            item.guid = data.customer.guid;
            self.Customer = item;
            self.Customer.allowedit = true;
            self.Customer.allowremove = true;
            self.Customer.oldvalue = angular.copy(self.Customer);
            self.Customer.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Customer", false);
    }
    function SaveCustomer(item) {
        if (ValidateCustomer(item)) {
            self.Processing.SetProcessing("Customer", true);
            var json = JSON.stringify(ConvertCustomerToPostObject(item));
            $http.post(self.GetUrl.saveCustomer, json).
             success(function (data, status, headers, config) {
                 FinishSaveCustomer(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateCustomer(item) {
        return true;
    }
    function FinishSaveCustomer(data) {
        if (data.result == "Success") {
            self.Customer.Id = data.customer.Id;
            self.Id = data.customer.Id;
            self.Customer.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Customer", false);
    }
    function DeleteCustomer(item) {
        self.Processing.SetProcessing("Customer", true);
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
                        $http.post(self.GetUrl.removeCustomer, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Customer", false);
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
                             self.Processing.SetProcessing("Customer", false);
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
}
