var IncomeViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getIncome: $http.defaults.route + "income/getbyid",
        saveIncome: $http.defaults.route + "income/save",
        removeIncome: $http.defaults.route + "income/remove",
        getInit: $http.defaults.route + "income/getinit"
    };
    self.Id = null;
    self.Income = null;
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
        InitIncome();
    };
    self.startEditIncome = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditIncome = function (item) {
        SaveIncome(item);
    };
    self.cancelEditIncome = function (item) {
        ResetIncome(item);
        item.isedit = false;
    };
    self.removeIncome = function (item) {
        DeleteIncome(item);
    };
    function InitIncome() {
        self.Processing.SetProcessing("Income", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getIncome, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitIncome(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewIncome(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitIncome(data) {
        if (data.result == "Success") {
            self.Income = self.ConvertDataToIncome(data.income);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Income", false);
    }
    function FinishInitNewIncome(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncome(data.income);
            item.guid = data.income.guid;
            self.Income = item;
            self.Income.allowedit = true;
            self.Income.allowremove = true;
            self.Income.oldvalue = angular.copy(self.Income);
            self.Income.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Income", false);
    }
    function SaveIncome(item) {
        if (ValidateIncome(item)) {
            self.Processing.SetProcessing("Income", true);
            var json = JSON.stringify(ConvertIncomeToPostObject(item));
            $http.post(self.GetUrl.saveIncome, json).
             success(function (data, status, headers, config) {
                 FinishSaveIncome(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateIncome(item) {
        return true;
    }
    function FinishSaveIncome(data) {
        if (data.result == "Success") {
            self.Income.Id = data.income.Id;
            self.Id = data.income.Id;
            self.Income.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Income", false);
    }
    function DeleteIncome(item) {
        self.Processing.SetProcessing("Income", true);
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
                        $http.post(self.GetUrl.removeIncome, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Income", false);
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
                             self.Processing.SetProcessing("Income", false);
                         });
                    }
                }
            });
    }
    function ConvertIncomeToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          CustomerId: item.CustomerId,
                          Type: item.Type,
                          InvoiceNo: item.InvoiceNo,
                          InvoiceDate: item.InvoiceDate,
                          DueDate: item.DueDate,
                          Amount: item.Amount,
                          Description: item.Description,
                          Status: item.Status,
                          guid: item.guid
                         };
           if(item.InvoiceDate!==null)
           {
               postObject.InvoiceDate = parseJsonDateS(item.InvoiceDate);
           }
           if(item.DueDate!==null)
           {
               postObject.DueDate = parseJsonDateS(item.DueDate);
           }
        return postObject;
    }
    function ResetIncome(item) {
        item.Id = item.oldvalue.Id;
        item.CustomerId = item.oldvalue.CustomerId;
        item.Type = item.oldvalue.Type;
        item.InvoiceNo = item.oldvalue.InvoiceNo;
        item.InvoiceDate = item.oldvalue.InvoiceDate;
        item.DueDate = item.oldvalue.DueDate;
        item.Amount = item.oldvalue.Amount;
        item.Description = item.oldvalue.Description;
        item.Status = item.oldvalue.Status;
        item.CustomerName = item.oldvalue.CustomerName;
    }
    self.ConvertDataToIncome = function (dataItem) {
        var item = new Income(
                              dataItem.Id,
                              dataItem.CustomerId,
                              dataItem.Type,
                              dataItem.InvoiceNo,
                              dataItem.InvoiceDate,
                              dataItem.DueDate,
                              dataItem.Amount,
                              dataItem.Description,
                              dataItem.Status
                            );
        if(dataItem.Customer!=null) {
            if(dataItem.Customer.Title!=null) {
                item.CustomerName = dataItem.Customer.Title + ". " + dataItem.Customer.FullName;
            }else{
                item.CustomerName = dataItem.Customer.FullName;
            }
        }
        return item;
    };
}
