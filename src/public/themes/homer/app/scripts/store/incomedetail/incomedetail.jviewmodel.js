var IncomeDetailViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getIncomeDetail: $http.defaults.route + "incomedetail/getbyid",
        saveIncomeDetail: $http.defaults.route + "incomedetail/save",
        removeIncomeDetail: $http.defaults.route + "incomedetail/remove",
        getInit: $http.defaults.route + "incomedetail/getinit"
    };
    self.Id = null;
    self.IncomeDetail = null;
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
        InitIncomeDetail();
    };
    self.startEditIncomeDetail = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditIncomeDetail = function (item) {
        SaveIncomeDetail(item);
    };
    self.cancelEditIncomeDetail = function (item) {
        ResetIncomeDetail(item);
        item.isedit = false;
    };
    self.removeIncomeDetail = function (item) {
        DeleteIncomeDetail(item);
    };
    function InitIncomeDetail() {
        self.Processing.SetProcessing("IncomeDetail", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getIncomeDetail, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitIncomeDetail(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewIncomeDetail(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitIncomeDetail(data) {
        if (data.result == "Success") {
            self.IncomeDetail = self.ConvertDataToIncomeDetail(data.incomedetail);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("IncomeDetail", false);
    }
    function FinishInitNewIncomeDetail(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncomeDetail(data.incomedetail);
            item.guid = data.incomedetail.guid;
            self.IncomeDetail = item;
            self.IncomeDetail.allowedit = true;
            self.IncomeDetail.allowremove = true;
            self.IncomeDetail.oldvalue = angular.copy(self.IncomeDetail);
            self.IncomeDetail.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("IncomeDetail", false);
    }
    function SaveIncomeDetail(item) {
        if (ValidateIncomeDetail(item)) {
            self.Processing.SetProcessing("IncomeDetail", true);
            var json = JSON.stringify(ConvertIncomeDetailToPostObject(item));
            $http.post(self.GetUrl.saveIncomeDetail, json).
             success(function (data, status, headers, config) {
                 FinishSaveIncomeDetail(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateIncomeDetail(item) {
        return true;
    }
    function FinishSaveIncomeDetail(data) {
        if (data.result == "Success") {
            self.IncomeDetail.Id = data.incomedetail.Id;
            self.Id = data.incomedetail.Id;
            self.IncomeDetail.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("IncomeDetail", false);
    }
    function DeleteIncomeDetail(item) {
        self.Processing.SetProcessing("IncomeDetail", true);
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
                        $http.post(self.GetUrl.removeIncomeDetail, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("IncomeDetail", false);
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
                             self.Processing.SetProcessing("IncomeDetail", false);
                         });
                    }
                }
            });
    }
    function ConvertIncomeDetailToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          IncomeId: item.IncomeId,
                          ProductId: item.ProductId,
                          Quantity: item.Quantity,
                          UnitPrice: item.UnitPrice,
                          Discount: item.Discount,
                          Note: item.Note,
                          guid: item.guid
                         };
        return postObject;
    }
    function ResetIncomeDetail(item) {
        item.Id = item.oldvalue.Id;
        item.IncomeId = item.oldvalue.IncomeId;
        item.ProductId = item.oldvalue.ProductId;
        item.Quantity = item.oldvalue.Quantity;
        item.UnitPrice = item.oldvalue.UnitPrice;
        item.Discount = item.oldvalue.Discount;
        item.Note = item.oldvalue.Note;
    }
    self.ConvertDataToIncomeDetail = function (dataItem) {
        var item = new IncomeDetail(
                              dataItem.Id,
                              dataItem.IncomeId,
                              dataItem.ProductId,
                              dataItem.Quantity,
                              dataItem.UnitPrice,
                              dataItem.Discount,
                              dataItem.Note
                            );
        return item;
    };
}
