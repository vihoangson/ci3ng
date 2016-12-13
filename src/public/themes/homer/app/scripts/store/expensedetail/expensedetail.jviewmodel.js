var ExpenseDetailViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getExpenseDetail: $http.defaults.route + "expensedetail/getbyid",
        saveExpenseDetail: $http.defaults.route + "expensedetail/save",
        removeExpenseDetail: $http.defaults.route + "expensedetail/remove",
        getInit: $http.defaults.route + "expensedetail/getinit"
    };
    self.Id = null;
    self.ExpenseDetail = null;
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
        InitExpenseDetail();
    };
    self.startEditExpenseDetail = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditExpenseDetail = function (item) {
        SaveExpenseDetail(item);
    };
    self.cancelEditExpenseDetail = function (item) {
        ResetExpenseDetail(item);
        item.isedit = false;
    };
    self.removeExpenseDetail = function (item) {
        DeleteExpenseDetail(item);
    };
    function InitExpenseDetail() {
        self.Processing.SetProcessing("ExpenseDetail", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getExpenseDetail, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitExpenseDetail(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewExpenseDetail(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitExpenseDetail(data) {
        if (data.result == "Success") {
            self.ExpenseDetail = self.ConvertDataToExpenseDetail(data.expensedetail);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("ExpenseDetail", false);
    }
    function FinishInitNewExpenseDetail(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToExpenseDetail(data.expensedetail);
            item.guid = data.expensedetail.guid;
            self.ExpenseDetail = item;
            self.ExpenseDetail.allowedit = true;
            self.ExpenseDetail.allowremove = true;
            self.ExpenseDetail.oldvalue = angular.copy(self.ExpenseDetail);
            self.ExpenseDetail.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("ExpenseDetail", false);
    }
    function SaveExpenseDetail(item) {
        if (ValidateExpenseDetail(item)) {
            self.Processing.SetProcessing("ExpenseDetail", true);
            var json = JSON.stringify(ConvertExpenseDetailToPostObject(item));
            $http.post(self.GetUrl.saveExpenseDetail, json).
             success(function (data, status, headers, config) {
                 FinishSaveExpenseDetail(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateExpenseDetail(item) {
        return true;
    }
    function FinishSaveExpenseDetail(data) {
        if (data.result == "Success") {
            self.ExpenseDetail.Id = data.expensedetail.Id;
            self.Id = data.expensedetail.Id;
            self.ExpenseDetail.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("ExpenseDetail", false);
    }
    function DeleteExpenseDetail(item) {
        self.Processing.SetProcessing("ExpenseDetail", true);
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
                        $http.post(self.GetUrl.removeExpenseDetail, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("ExpenseDetail", false);
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
                             self.Processing.SetProcessing("ExpenseDetail", false);
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
        return item;
    };
}
