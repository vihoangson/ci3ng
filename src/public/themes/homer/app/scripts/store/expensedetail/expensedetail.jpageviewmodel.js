var ExpenseDetailsPageViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
       getInit: $http.defaults.route +"expensedetail/getinit",
        getExpenseDetails: $http.defaults.route +"expensedetail/getpage",
        saveExpenseDetail: $http.defaults.route +"expensedetail/save",
        removeExpenseDetail: $http.defaults.route +"expensedetail/remove"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.Paging = new ItemPaging(1, 20, 0);
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.ArrExpenseDetail = new Array();
    //------- Init data for view model----------------------------
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.InitData = function () {
        InitExpenseDetails();
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
    //--------------- For Paging and Searching -----------------------------//
    self.searchExpenseDetails = function () {
        self.Paging.PageIndex = 1;
        InitExpenseDetails();
    };
    self.gotoPage = function (page) {
        if (page != self.Paging.PageIndex) {
            self.Paging.PageIndex = page;
            InitExpenseDetails();
        }
    };
    self.gotoNextPage = function () {
        if (self.Paging.PageIndex < self.Paging.TotalPages) {
            self.Paging.PageIndex = self.Paging.PageIndex + 1;
            InitExpenseDetails();
        }
    };
    self.gotoPrevPage = function () {
        if (self.Paging.PageIndex > 1) {
            self.Paging.PageIndex = self.Paging.PageIndex - 1;
            InitExpenseDetails();
        }
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddExpenseDetail = function () {
        self.Processing.SetProcessing("ExpenseDetails", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewExpenseDetail(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditExpenseDetail = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditExpenseDetail = function (item) {
        SaveExpenseDetail(item);
    };
    self.cancelEditExpenseDetail = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrExpenseDetail.splice(self.ArrExpenseDetail.indexOf(item), 1);
        } else {
            ResetExpenseDetail(item);
            item.isedit = false;
        }
    }
    self.removeExpenseDetail = function (item) {
        DeleteExpenseDetail(item);
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
        self.Paging.PageIndex = 1;
        InitExpenseDetails();
    };
    //--------------- Action Function ----------//
    function FinishInitNewExpenseDetail(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToExpenseDetail(data.expensedetail);
            item.guid = data.expensedetail.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrExpenseDetail.push(item);
        }
        self.Processing.SetProcessing("ExpenseDetails", false);
    }
    function InitExpenseDetails() {
        self.Processing.SetProcessing("ExpenseDetails", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getExpenseDetails, json).
           success(function (data, status, headers, config) {
               FinishInitExpenseDetails(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitExpenseDetails(data) {
        if(self.GetUrl.getIncomeDetails!=$http.defaults.route +"incomedetail/getpage?export=pdf") {
            if (data.result == "Success") {
                self.ArrExpenseDetail = new Array();
                angular.forEach(data.expensedetails, function(item) {
                    self.ArrExpenseDetail.push(self.ConvertDataToExpenseDetail(item));
                });
                self.Paging.ResetPaging(data.pageindex, data.pagesize, data.totalcount);
            }
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("ExpenseDetails", false);
    }
    function SaveExpenseDetail(item) {
        if (ValidateExpenseDetail(item)) {
            self.Processing.SetProcessing("ExpenseDetails", true);
            var json = JSON.stringify(ConvertExpenseDetailToPostObject(item));
            $http.post(self.GetUrl.saveExpenseDetail, json).
             success(function (data, status, headers, config) {
                 FinishSaveExpenseDetail(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveExpenseDetail(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrExpenseDetail, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrExpenseDetail, { guid: data.guid })[0];
            }
            if (item != null) {
                if (data.Id == null || data.Id == 0) {
                    self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems + 1);
                }
                item.Id = data.expensedetail.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("ExpenseDetails", false);
    }
    function DeleteExpenseDetail(item) {
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
                               self.ArrExpenseDetail.splice(self.ArrExpenseDetail.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("ExpenseDetails", true);
                           $http.post(self.GetUrl.removeExpenseDetail, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrExpenseDetail, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrExpenseDetail.splice(self.ArrExpenseDetail.indexOf(item), 1);
                                         self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems - 1);
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
                                 self.Processing.SetProcessing("ExpenseDetails", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("ExpenseDetails", false);
                          });
                       }
                   }
               });
    }
    function ConvertExpenseDetailToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          ExpenseId: item.ExpenseId,
                          ProductId: item.ProductId,
                          ItemName: item.ItemName,
                          Quantity: item.Quantity,
                          UnitPrice: item.UnitPrice,
                          guid: item.guid
                         };
        return postObject;
    }
    function ResetExpenseDetail(item) {
        item.Id = item.oldvalue.Id;
        item.ExpenseId = item.oldvalue.ExpenseId;
        item.ProductId = item.oldvalue.ProductId;
        item.ItemName = item.oldvalue.ItemName;
        item.Quantity = item.oldvalue.Quantity;
        item.UnitPrice = item.oldvalue.UnitPrice;
    }
    self.ConvertDataToExpenseDetail = function (dataItem) {
        var item = new ExpenseDetail(
                              dataItem.Id,
                              dataItem.ExpenseId,
                              dataItem.ProductId,
                              dataItem.ItemName,
                              dataItem.Quantity,
                              dataItem.UnitPrice
                            );
        if(dataItem.Expense!=null){
            item.Description = dataItem.Expense.Description;
            item.InvoiceNo = dataItem.Expense.InvoiceNo;
            item.InvoiceDateF = parseJsonDateF(dataItem.Expense.InvoiceDate);
        }
        return item;
    };
    function SetGetParam() {
        var postParam = {
            pageindex: self.Paging.PageIndex,
            pagesize: self.Paging.PageSize,
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
    function ValidateExpenseDetail(item) {
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
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
