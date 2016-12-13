var IncomesViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "income/getinit",
        getIncomes: $http.defaults.route + "income/getmany",
        saveIncome: $http.defaults.route + "income/save",
        removeIncome: $http.defaults.route + "income/remove",
        saveListIncome: $http.defaults.route + "income/savelist"
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
    self.ArrSIncome = new Array();
    self.ArrIncome = new Array();
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
        InitIncomes();
    };
    //--------------- For Searching -----------------------------//
    self.searchIncomes = function () {
        InitIncomes();
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddIncome = function () {
        self.Processing.SetProcessing("Incomes", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewIncome(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditIncome = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditIncome = function (item) {
        SaveIncome(item);
    };
    self.cancelEditIncome = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrIncome.splice(self.ArrIncome.indexOf(item), 1);
        } else {
            ResetIncome(item);
            item.isedit = false;
        }
    }
    self.removeIncome = function (item) {
        DeleteIncome(item);
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
        InitIncomes();
    };
    //--------------- Action Function ----------//
    function FinishInitNewIncome(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncome(data.income);
            item.guid = data.income.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
            self.ArrIncome.push(item);
        }
        self.Processing.SetProcessing("Incomes", false);
    }
    function InitIncomes() {
        self.Processing.SetProcessing("Incomes", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getIncomes, json).
           success(function (data, status, headers, config) {
               FinishInitIncomes(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitIncomes(data) {
        if (data.result == "Success") {
            self.ArrIncome = new Array();
            angular.forEach(data.incomes, function (item) {
                self.ArrIncome.push(self.ConvertDataToIncome(item));
            });
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Incomes", false);
    }
    function SaveIncome(item) {
        if (ValidateIncome(item)) {
            self.Processing.SetProcessing("Incomes", true);
            var json = JSON.stringify(ConvertIncomeToPostObject(item));
            $http.post(self.GetUrl.saveIncome, json).
             success(function (data, status, headers, config) {
                 FinishSaveIncome(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveIncome(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrIncome, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrIncome, { guid: data.guid })[0];
            }
            if (item != null) {
                item.Id = data.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Incomes", false);
    }
    function DeleteIncome(item) {
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
                               self.ArrIncome.splice(self.ArrIncome.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Incomes", true);
                           $http.post(self.GetUrl.removeIncome, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrIncome, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrIncome.splice(self.ArrIncome.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("Incomes", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Incomes", false);
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
    function ValidateIncome(item) {
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

    self.startAddListIncome = function () {
        self.Processing.SetProcessing("Incomes", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewIncome(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListIncome = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListIncome = function (item) {
        if (ValidateIncome(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListIncome = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetIncome(item);
        item.isedit(false);
    }
    self.removeListIncome = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrIncome.splice(self.ArrIncome.indexOf(item), 1);
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
    self.saveAllIncome = function () {
        SaveListIncome();
    };
    function FinishInitListNewIncome(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncome(data.income);
            item.guid = data.income.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrIncome.push(item);
        }
        self.Processing.SetProcessing("Incomes", false);
    }
    function SaveListIncome() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSIncome.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrIncome.length && numsave > 0; i++) {
            var item = self.ArrIncome[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidateIncome(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSIncome.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Incomes", true);
            var json = JSON.stringify({incomes:postArray});
            $http.post(self.GetUrl.saveListIncome, json).
             success(function (data, status, headers, config) {
                 FinishSaveListIncome(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListIncome(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSIncome, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.incomes, { guid: data.guid })[0];
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
        if (self.ArrIncome.length == self.ArrSIncome.length) {
            self.Processing.SetProcessing("Incomes", false);
            self.ArrSIncome = new Array();
            var deleteItems = $filter("filter")(self.ArrIncome,{editmode:"Delete"});
            angular.forEach(deleteItems, function (item) {
                self.ArrIncome.splice(self.ArrIncome.indexOf(item), 1);
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListIncome();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
