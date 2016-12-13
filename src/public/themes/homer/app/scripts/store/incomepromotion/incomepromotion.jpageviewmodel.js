var IncomePromotionsPageViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
       getInit: $http.defaults.route +"incomepromotion/getinit",
        getIncomePromotions: $http.defaults.route +"incomepromotion/getpage",
        saveIncomePromotion: $http.defaults.route +"incomepromotion/save",
        removeIncomePromotion: $http.defaults.route +"incomepromotion/remove"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.Paging = new ItemPaging(1, 20, 0);
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.ArrIncomePromotion = new Array();
    //------- Init data for view model----------------------------
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.InitData = function () {
        InitIncomePromotions();
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
    self.searchIncomePromotions = function () {
        self.Paging.PageIndex = 1;
        InitIncomePromotions();
    };
    self.gotoPage = function (page) {
        if (page != self.Paging.PageIndex) {
            self.Paging.PageIndex = page;
            InitIncomePromotions();
        }
    };
    self.gotoNextPage = function () {
        if (self.Paging.PageIndex < self.Paging.TotalPages) {
            self.Paging.PageIndex = self.Paging.PageIndex + 1;
            InitIncomePromotions();
        }
    };
    self.gotoPrevPage = function () {
        if (self.Paging.PageIndex > 1) {
            self.Paging.PageIndex = self.Paging.PageIndex - 1;
            InitIncomePromotions();
        }
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddIncomePromotion = function () {
        self.Processing.SetProcessing("IncomePromotions", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewIncomePromotion(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditIncomePromotion = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditIncomePromotion = function (item) {
        SaveIncomePromotion(item);
    };
    self.cancelEditIncomePromotion = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrIncomePromotion.splice(self.ArrIncomePromotion.indexOf(item), 1);
        } else {
            ResetIncomePromotion(item);
            item.isedit = false;
        }
    }
    self.removeIncomePromotion = function (item) {
        DeleteIncomePromotion(item);
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
        InitIncomePromotions();
    };
    //--------------- Action Function ----------//
    function FinishInitNewIncomePromotion(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncomePromotion(data.incomepromotion);
            item.guid = data.incomepromotion.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrIncomePromotion.push(item);
        }
        self.Processing.SetProcessing("IncomePromotions", false);
    }
    function InitIncomePromotions() {
        self.Processing.SetProcessing("IncomePromotions", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getIncomePromotions, json).
           success(function (data, status, headers, config) {
               FinishInitIncomePromotions(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitIncomePromotions(data) {
        if (data.result == "Success") {
            self.ArrIncomePromotion = new Array();
            angular.forEach(data.incomepromotions, function (item) {
                self.ArrIncomePromotion.push(self.ConvertDataToIncomePromotion(item));
            });
            self.Paging.ResetPaging(data.pageindex, data.pagesize, data.totalcount);
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("IncomePromotions", false);
    }
    function SaveIncomePromotion(item) {
        if (ValidateIncomePromotion(item)) {
            self.Processing.SetProcessing("IncomePromotions", true);
            var json = JSON.stringify(ConvertIncomePromotionToPostObject(item));
            $http.post(self.GetUrl.saveIncomePromotion, json).
             success(function (data, status, headers, config) {
                 FinishSaveIncomePromotion(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveIncomePromotion(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrIncomePromotion, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrIncomePromotion, { guid: data.guid })[0];
            }
            if (item != null) {
                if (data.Id == null || data.Id == 0) {
                    self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems + 1);
                }
                item.Id = data.incomepromotion.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("IncomePromotions", false);
    }
    function DeleteIncomePromotion(item) {
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
                               self.ArrIncomePromotion.splice(self.ArrIncomePromotion.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("IncomePromotions", true);
                           $http.post(self.GetUrl.removeIncomePromotion, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrIncomePromotion, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrIncomePromotion.splice(self.ArrIncomePromotion.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("IncomePromotions", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("IncomePromotions", false);
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
    function ValidateIncomePromotion(item) {
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
