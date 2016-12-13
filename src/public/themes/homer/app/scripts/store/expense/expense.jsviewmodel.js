var ExpensesViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "expense/getinit",
        getExpenses: $http.defaults.route + "expense/getmany",
        saveExpense: $http.defaults.route + "expense/save",
        removeExpense: $http.defaults.route + "expense/remove",
        saveListExpense: $http.defaults.route + "expense/savelist"
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
    self.ArrSExpense = new Array();
    self.ArrExpense = new Array();
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
        InitExpenses();
    };
    //--------------- For Searching -----------------------------//
    self.searchExpenses = function () {
        InitExpenses();
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddExpense = function () {
        self.Processing.SetProcessing("Expenses", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewExpense(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditExpense = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditExpense = function (item) {
        SaveExpense(item);
    };
    self.cancelEditExpense = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrExpense.splice(self.ArrExpense.indexOf(item), 1);
        } else {
            ResetExpense(item);
            item.isedit = false;
        }
    }
    self.removeExpense = function (item) {
        DeleteExpense(item);
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
        InitExpenses();
    };
    //--------------- Action Function ----------//
    function FinishInitNewExpense(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToExpense(data.expense);
            item.guid = data.expense.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
            self.ArrExpense.push(item);
        }
        self.Processing.SetProcessing("Expenses", false);
    }
    function InitExpenses() {
        self.Processing.SetProcessing("Expenses", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getExpenses, json).
           success(function (data, status, headers, config) {
               FinishInitExpenses(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitExpenses(data) {
        if (data.result == "Success") {
            self.ArrExpense = new Array();
            angular.forEach(data.expenses, function (item) {
                self.ArrExpense.push(self.ConvertDataToExpense(item));
            });
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Expenses", false);
    }
    function SaveExpense(item) {
        if (ValidateExpense(item)) {
            self.Processing.SetProcessing("Expenses", true);
            var json = JSON.stringify(ConvertExpenseToPostObject(item));
            $http.post(self.GetUrl.saveExpense, json).
             success(function (data, status, headers, config) {
                 FinishSaveExpense(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveExpense(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrExpense, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrExpense, { guid: data.guid })[0];
            }
            if (item != null) {
                item.Id = data.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Expenses", false);
    }
    function DeleteExpense(item) {
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
                               self.ArrExpense.splice(self.ArrExpense.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Expenses", true);
                           $http.post(self.GetUrl.removeExpense, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrExpense, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrExpense.splice(self.ArrExpense.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("Expenses", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Expenses", false);
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
    function ValidateExpense(item) {
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

    self.startAddListExpense = function () {
        self.Processing.SetProcessing("Expenses", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewExpense(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListExpense = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListExpense = function (item) {
        if (ValidateExpense(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListExpense = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetExpense(item);
        item.isedit(false);
    }
    self.removeListExpense = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrExpense.splice(self.ArrExpense.indexOf(item), 1);
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
    self.saveAllExpense = function () {
        SaveListExpense();
    };
    function FinishInitListNewExpense(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToExpense(data.expense);
            item.guid = data.expense.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrExpense.push(item);
        }
        self.Processing.SetProcessing("Expenses", false);
    }
    function SaveListExpense() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSExpense.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrExpense.length && numsave > 0; i++) {
            var item = self.ArrExpense[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidateExpense(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSExpense.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Expenses", true);
            var json = JSON.stringify({expenses:postArray});
            $http.post(self.GetUrl.saveListExpense, json).
             success(function (data, status, headers, config) {
                 FinishSaveListExpense(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListExpense(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSExpense, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.expenses, { guid: data.guid })[0];
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
        if (self.ArrExpense.length == self.ArrSExpense.length) {
            self.Processing.SetProcessing("Expenses", false);
            self.ArrSExpense = new Array();
            var deleteItems = $filter("filter")(self.ArrExpense,{editmode:"Delete"});
            angular.forEach(deleteItems, function (item) {
                self.ArrExpense.splice(self.ArrExpense.indexOf(item), 1);
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListExpense();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
