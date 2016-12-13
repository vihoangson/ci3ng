var PromotionViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getPromotion: $http.defaults.route + "promotion/getbyid",
        savePromotion: $http.defaults.route + "promotion/save",
        removePromotion: $http.defaults.route + "promotion/remove",
        getInit: $http.defaults.route + "promotion/getinit"
    };
    self.Id = null;
    self.Promotion = null;
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
        InitPromotion();
    };
    self.startEditPromotion = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditPromotion = function (item) {
        SavePromotion(item);
    };
    self.cancelEditPromotion = function (item) {
        ResetPromotion(item);
        item.isedit = false;
    };
    self.removePromotion = function (item) {
        DeletePromotion(item);
    };
    function InitPromotion() {
        self.Processing.SetProcessing("Promotion", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getPromotion, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitPromotion(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewPromotion(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitPromotion(data) {
        if (data.result == "Success") {
            self.Promotion = self.ConvertDataToPromotion(data.promotion);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Promotion", false);
    }
    function FinishInitNewPromotion(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToPromotion(data.promotion);
            item.guid = data.promotion.guid;
            self.Promotion = item;
            self.Promotion.allowedit = true;
            self.Promotion.allowremove = true;
            self.Promotion.oldvalue = angular.copy(self.Promotion);
            self.Promotion.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Promotion", false);
    }
    function SavePromotion(item) {
        if (ValidatePromotion(item)) {
            self.Processing.SetProcessing("Promotion", true);
            var json = JSON.stringify(ConvertPromotionToPostObject(item));
            $http.post(self.GetUrl.savePromotion, json).
             success(function (data, status, headers, config) {
                 FinishSavePromotion(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidatePromotion(item) {
        return true;
    }
    function FinishSavePromotion(data) {
        if (data.result == "Success") {
            self.Promotion.Id = data.promotion.Id;
            self.Id = data.promotion.Id;
            self.Promotion.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Promotion", false);
    }
    function DeletePromotion(item) {
        self.Processing.SetProcessing("Promotion", true);
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
                        $http.post(self.GetUrl.removePromotion, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Promotion", false);
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
                             self.Processing.SetProcessing("Promotion", false);
                         });
                    }
                }
            });
    }
    function ConvertPromotionToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          Type: item.Type,
                          Name: item.Name,
                          Description: item.Description,
                          StartDate: item.StartDate,
                          StopDate: item.StopDate,
                          RequireCoupon: item.RequireCoupon,
                          Position: item.Position,
                          Status: item.Status,
                          guid: item.guid
                         };
           if(item.StartDate!==null)
           {
               postObject.StartDate = parseJsonDateS(item.StartDate);
           }
           if(item.StopDate!==null)
           {
               postObject.StopDate = parseJsonDateS(item.StopDate);
           }
        return postObject;
    }
    function ResetPromotion(item) {
        item.Id = item.oldvalue.Id;
        item.Type = item.oldvalue.Type;
        item.Name = item.oldvalue.Name;
        item.Description = item.oldvalue.Description;
        item.StartDate = item.oldvalue.StartDate;
        item.StopDate = item.oldvalue.StopDate;
        item.RequireCoupon = item.oldvalue.RequireCoupon;
        item.Position = item.oldvalue.Position;
        item.Status = item.oldvalue.Status;
    }
    self.ConvertDataToPromotion = function (dataItem) {
        var item = new Promotion(
                              dataItem.Id,
                              dataItem.Type,
                              dataItem.Name,
                              dataItem.Description,
                              dataItem.StartDate,
                              dataItem.StopDate,
                              dataItem.RequireCoupon,
                              dataItem.Position,
                              dataItem.Status
                            );
        return item;
    };
}
