var PromotionsPageViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
       getInit: $http.defaults.route +"promotion/getinit",
        getPromotions: $http.defaults.route +"promotion/getpage",
        savePromotion: $http.defaults.route +"promotion/save",
        removePromotion: $http.defaults.route +"promotion/remove"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.Paging = new ItemPaging(1, 20, 0);
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.ArrPromotion = new Array();
    //------- Init data for view model----------------------------
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.InitData = function () {
        InitPromotions();
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
    self.searchPromotions = function () {
        self.Paging.PageIndex = 1;
        InitPromotions();
    };
    self.gotoPage = function (page) {
        if (page != self.Paging.PageIndex) {
            self.Paging.PageIndex = page;
            InitPromotions();
        }
    };
    self.gotoNextPage = function () {
        if (self.Paging.PageIndex < self.Paging.TotalPages) {
            self.Paging.PageIndex = self.Paging.PageIndex + 1;
            InitPromotions();
        }
    };
    self.gotoPrevPage = function () {
        if (self.Paging.PageIndex > 1) {
            self.Paging.PageIndex = self.Paging.PageIndex - 1;
            InitPromotions();
        }
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
        self.Paging.PageIndex = 1;
        InitPromotions();
    };
    //--------------- Action Function ----------//
    function FinishInitNewPromotion(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToPromotion(data.promotion);
            item.guid = data.promotion.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
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
            self.Paging.ResetPaging(data.pageindex, data.pagesize, data.totalcount);
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
                if (data.Id == null || data.Id == 0) {
                    self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems + 1);
                }
                item.Id = data.promotion.Id;
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
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
