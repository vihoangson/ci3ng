var PromotionsViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "promotion/getinit",
        getPromotions: $http.defaults.route + "promotion/getmany",
        savePromotion: $http.defaults.route + "promotion/save",
        removePromotion: $http.defaults.route + "promotion/remove",
        saveListPromotion: $http.defaults.route + "promotion/savelist"
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
    self.ArrSPromotion = new Array();
    self.ArrPromotion = new Array();
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
        InitPromotions();
    };
    //--------------- For Searching -----------------------------//
    self.searchPromotions = function () {
        InitPromotions();
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddPromotion = function () {
        self.Processing.SetProcessing("Promotions", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewPromotion(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditPromotion = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditPromotion = function (item) {
        SavePromotion(item);
    };
    self.cancelEditPromotion = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrPromotion.splice(self.ArrPromotion.indexOf(item), 1);
        } else {
            ResetPromotion(item);
            item.isedit = false;
        }
    }
    self.removePromotion = function (item) {
        DeletePromotion(item);
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
        InitPromotions();
    };
    //--------------- Action Function ----------//
    function FinishInitNewPromotion(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToPromotion(data.promotion);
            item.guid = data.promotion.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
            self.ArrPromotion.push(item);
        }
        self.Processing.SetProcessing("Promotions", false);
    }
    function InitPromotions() {
        self.Processing.SetProcessing("Promotions", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getPromotions, json).
           success(function (data, status, headers, config) {
               FinishInitPromotions(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitPromotions(data) {
        if (data.result == "Success") {
            self.ArrPromotion = new Array();
            angular.forEach(data.promotions, function (item) {
                self.ArrPromotion.push(self.ConvertDataToPromotion(item));
            });
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Promotions", false);
    }
    function SavePromotion(item) {
        if (ValidatePromotion(item)) {
            self.Processing.SetProcessing("Promotions", true);
            var json = JSON.stringify(ConvertPromotionToPostObject(item));
            $http.post(self.GetUrl.savePromotion, json).
             success(function (data, status, headers, config) {
                 FinishSavePromotion(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSavePromotion(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrPromotion, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrPromotion, { guid: data.guid })[0];
            }
            if (item != null) {
                item.Id = data.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Promotions", false);
    }
    function DeletePromotion(item) {
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
                               self.ArrPromotion.splice(self.ArrPromotion.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Promotions", true);
                           $http.post(self.GetUrl.removePromotion, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrPromotion, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrPromotion.splice(self.ArrPromotion.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("Promotions", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Promotions", false);
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
    function ValidatePromotion(item) {
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

    self.startAddListPromotion = function () {
        self.Processing.SetProcessing("Promotions", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewPromotion(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListPromotion = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListPromotion = function (item) {
        if (ValidatePromotion(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListPromotion = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetPromotion(item);
        item.isedit(false);
    }
    self.removeListPromotion = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrPromotion.splice(self.ArrPromotion.indexOf(item), 1);
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
    self.saveAllPromotion = function () {
        SaveListPromotion();
    };
    function FinishInitListNewPromotion(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToPromotion(data.promotion);
            item.guid = data.promotion.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrPromotion.push(item);
        }
        self.Processing.SetProcessing("Promotions", false);
    }
    function SaveListPromotion() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSPromotion.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrPromotion.length && numsave > 0; i++) {
            var item = self.ArrPromotion[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidatePromotion(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSPromotion.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Promotions", true);
            var json = JSON.stringify({promotions:postArray});
            $http.post(self.GetUrl.saveListPromotion, json).
             success(function (data, status, headers, config) {
                 FinishSaveListPromotion(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListPromotion(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSPromotion, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.promotions, { guid: data.guid })[0];
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
        if (self.ArrPromotion.length == self.ArrSPromotion.length) {
            self.Processing.SetProcessing("Promotions", false);
            self.ArrSPromotion = new Array();
            var deleteItems = $filter("filter")(self.ArrPromotion,{editmode:"Delete"});
            angular.forEach(deleteItems, function (item) {
                self.ArrPromotion.splice(self.ArrPromotion.indexOf(item), 1);
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListPromotion();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
