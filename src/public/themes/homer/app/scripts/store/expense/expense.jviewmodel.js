var ExpenseViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getExpense: $http.defaults.route + "expense/getbyid",
        saveExpense: $http.defaults.route + "expense/save",
        removeExpense: $http.defaults.route + "expense/remove",
        getInit: $http.defaults.route + "expense/getinit"
    };
    self.Id = null;
    self.Expense = null;
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
        InitExpense();
    };
    self.startEditExpense = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditExpense = function (item) {
        SaveExpense(item);
    };
    self.cancelEditExpense = function (item) {
        ResetExpense(item);
        item.isedit = false;
        item.valmanager.Reset();
    };
    self.removeExpense = function (item) {
        DeleteExpense(item);
    };
    function InitExpense() {
        self.Processing.SetProcessing("Expense", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getExpense, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitExpense(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewExpense(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitExpense(data) {
        if (data.result == "Success") {
            self.Expense = self.ConvertDataToExpense(data.expense);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Expense", false);
    }
    function FinishInitNewExpense(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToExpense(data.expense);
            item.guid = data.expense.guid;
            self.Expense = item;
            self.Expense.allowedit = true;
            self.Expense.allowremove = true;
            self.Expense.oldvalue = angular.copy(self.Expense);
            self.Expense.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Expense", false);
    }
    function SaveExpense(item) {
        if (ValidateExpense(item)) {
            self.Processing.SetProcessing("Expense", true);
            var json = JSON.stringify(ConvertExpenseToPostObject(item));
            $http.post(self.GetUrl.saveExpense, json).
             success(function (data, status, headers, config) {
                 FinishSaveExpense(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateExpense(item) {
        return true;
    }
    function FinishSaveExpense(data) {
        if (data.result == "Success") {
            self.Expense.Id = data.expense.Id;
            self.Id = data.expense.Id;
            self.Expense.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Expense", false);
    }
    function DeleteExpense(item) {
        self.Processing.SetProcessing("Expense", true);
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
                        $http.post(self.GetUrl.removeExpense, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Expense", false);
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
                             self.Processing.SetProcessing("Expense", false);
                         });
                    }
                }
            });
    }
    function ConvertExpenseToPostObject(item) {
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
    function ResetExpense(item) {
        item.Id = item.oldvalue.Id;
        item.CustomerId = item.oldvalue.CustomerId;
        item.Type = item.oldvalue.Type;
        item.InvoiceNo = item.oldvalue.InvoiceNo;
        item.InvoiceDate = item.oldvalue.InvoiceDate;
        item.DueDate = item.oldvalue.DueDate;
        item.Amount = item.oldvalue.Amount;
        item.Description = item.oldvalue.Description;
        item.Status = item.oldvalue.Status;
    }
    self.ConvertDataToExpense = function (dataItem) {
        var item = new Expense(
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
        return item;
    };
}
