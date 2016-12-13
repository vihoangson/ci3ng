var IncomePromotionViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getIncomePromotion: $http.defaults.route + "incomepromotion/getbyid",
        saveIncomePromotion: $http.defaults.route + "incomepromotion/save",
        removeIncomePromotion: $http.defaults.route + "incomepromotion/remove",
        getInit: $http.defaults.route + "incomepromotion/getinit"
    };
    self.Id = null;
    self.IncomePromotion = null;
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
        InitIncomePromotion();
    };
    self.startEditIncomePromotion = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditIncomePromotion = function (item) {
        SaveIncomePromotion(item);
    };
    self.cancelEditIncomePromotion = function (item) {
        ResetIncomePromotion(item);
        item.isedit = false;
    };
    self.removeIncomePromotion = function (item) {
        DeleteIncomePromotion(item);
    };
    function InitIncomePromotion() {
        self.Processing.SetProcessing("IncomePromotion", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getIncomePromotion, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitIncomePromotion(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewIncomePromotion(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitIncomePromotion(data) {
        if (data.result == "Success") {
            self.IncomePromotion = self.ConvertDataToIncomePromotion(data.incomepromotion);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("IncomePromotion", false);
    }
    function FinishInitNewIncomePromotion(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncomePromotion(data.incomepromotion);
            item.guid = data.incomepromotion.guid;
            self.IncomePromotion = item;
            self.IncomePromotion.allowedit = true;
            self.IncomePromotion.allowremove = true;
            self.IncomePromotion.oldvalue = angular.copy(self.IncomePromotion);
            self.IncomePromotion.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("IncomePromotion", false);
    }
    function SaveIncomePromotion(item) {
        if (ValidateIncomePromotion(item)) {
            self.Processing.SetProcessing("IncomePromotion", true);
            var json = JSON.stringify(ConvertIncomePromotionToPostObject(item));
            $http.post(self.GetUrl.saveIncomePromotion, json).
             success(function (data, status, headers, config) {
                 FinishSaveIncomePromotion(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateIncomePromotion(item) {
        return true;
    }
    function FinishSaveIncomePromotion(data) {
        if (data.result == "Success") {
            self.IncomePromotion.Id = data.incomepromotion.Id;
            self.Id = data.incomepromotion.Id;
            self.IncomePromotion.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("IncomePromotion", false);
    }
    function DeleteIncomePromotion(item) {
        self.Processing.SetProcessing("IncomePromotion", true);
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
                        $http.post(self.GetUrl.removeIncomePromotion, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("IncomePromotion", false);
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
                             self.Processing.SetProcessing("IncomePromotion", false);
                         });
                    }
                }
            });
    }
    function ConvertIncomePromotionToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          IncomeId: item.IncomeId,
                          PromotionName: item.PromotionName,
                          PromotionDescription: item.PromotionDescription,
                          Note: item.Note,
                          guid: item.guid
                         };
        return postObject;
    }
    function ResetIncomePromotion(item) {
        item.Id = item.oldvalue.Id;
        item.IncomeId = item.oldvalue.IncomeId;
        item.PromotionName = item.oldvalue.PromotionName;
        item.PromotionDescription = item.oldvalue.PromotionDescription;
        item.Note = item.oldvalue.Note;
    }
    self.ConvertDataToIncomePromotion = function (dataItem) {
        var item = new IncomePromotion(
                              dataItem.Id,
                              dataItem.IncomeId,
                              dataItem.PromotionName,
                              dataItem.PromotionDescription,
                              dataItem.Note
                            );
        return item;
    };
}
