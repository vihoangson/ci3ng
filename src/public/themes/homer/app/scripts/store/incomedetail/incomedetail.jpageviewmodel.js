var IncomeDetailsPageViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route +"incomedetail/getinit",
        getIncomeDetails: $http.defaults.route +"incomedetail/getpage",
        saveIncomeDetail: $http.defaults.route +"incomedetail/save",
        removeIncomeDetail: $http.defaults.route +"incomedetail/remove"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.Paging = new ItemPaging(1, 20, 0);
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.ArrIncomeDetail = new Array();
    //------- Init data for view model----------------------------
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.InitData = function () {
        InitIncomeDetails();
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
    self.searchIncomeDetails = function () {
        self.Paging.PageIndex = 1;
        InitIncomeDetails();
    };
    self.gotoPage = function (page) {
        if (page != self.Paging.PageIndex) {
            self.Paging.PageIndex = page;
            InitIncomeDetails();
        }
    };
    self.gotoNextPage = function () {
        if (self.Paging.PageIndex < self.Paging.TotalPages) {
            self.Paging.PageIndex = self.Paging.PageIndex + 1;
            InitIncomeDetails();
        }
    };
    self.gotoPrevPage = function () {
        if (self.Paging.PageIndex > 1) {
            self.Paging.PageIndex = self.Paging.PageIndex - 1;
            InitIncomeDetails();
        }
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddIncomeDetail = function () {
        self.Processing.SetProcessing("IncomeDetails", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewIncomeDetail(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditIncomeDetail = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditIncomeDetail = function (item) {
        SaveIncomeDetail(item);
    };
    self.cancelEditIncomeDetail = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrIncomeDetail.splice(self.ArrIncomeDetail.indexOf(item), 1);
        } else {
            ResetIncomeDetail(item);
            item.isedit = false;
        }
    }
    self.removeIncomeDetail = function (item) {
        DeleteIncomeDetail(item);
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
        InitIncomeDetails();
    };
    //--------------- Action Function ----------//
    function FinishInitNewIncomeDetail(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncomeDetail(data.incomedetail);
            item.guid = data.incomedetail.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrIncomeDetail.push(item);
        }
        self.Processing.SetProcessing("IncomeDetails", false);
    }
    function InitIncomeDetails() {
        self.Processing.SetProcessing("IncomeDetails", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getIncomeDetails, json).
           success(function (data, status, headers, config) {
               FinishInitIncomeDetails(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitIncomeDetails(data) {
        if(self.GetUrl.getIncomeDetails!=$http.defaults.route +"incomedetail/getpage?export=pdf") {
            if (data.result == "Success") {
                self.ArrIncomeDetail = new Array();
                angular.forEach(data.incomedetails, function(item) {
                    self.ArrIncomeDetail.push(self.ConvertDataToIncomeDetail(item));
                });
                self.Paging.ResetPaging(data.pageindex, data.pagesize, data.totalcount);
            }
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("IncomeDetails", false);
    }
    function SaveIncomeDetail(item) {
        if (ValidateIncomeDetail(item)) {
            self.Processing.SetProcessing("IncomeDetails", true);
            var json = JSON.stringify(ConvertIncomeDetailToPostObject(item));
            $http.post(self.GetUrl.saveIncomeDetail, json).
             success(function (data, status, headers, config) {
                 FinishSaveIncomeDetail(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveIncomeDetail(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrIncomeDetail, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrIncomeDetail, { guid: data.guid })[0];
            }
            if (item != null) {
                if (data.Id == null || data.Id == 0) {
                    self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems + 1);
                }
                item.Id = data.incomedetail.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("IncomeDetails", false);
    }
    function DeleteIncomeDetail(item) {
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
                               self.ArrIncomeDetail.splice(self.ArrIncomeDetail.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("IncomeDetails", true);
                           $http.post(self.GetUrl.removeIncomeDetail, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrIncomeDetail, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrIncomeDetail.splice(self.ArrIncomeDetail.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("IncomeDetails", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("IncomeDetails", false);
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
        if(dataItem.Income!=null){
            if(dataItem.Income.Customer.Title==null) {
                item.CustomerName = dataItem.Income.Customer.FullName;
            }else{
                item.CustomerName = dataItem.Income.Customer.Title + ". "+dataItem.Income.Customer.FullName;
            }
            item.InvoiceDateF = parseJsonDateF(dataItem.Income.InvoiceDate);
            item.InvoiceNo = dataItem.Income.InvoiceNo;
            item.IncomeType = dataItem.Income.Type;
        }
        if(dataItem.Product!=null){
            item.ProductName = dataItem.Product.Name;
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
    function ValidateIncomeDetail(item) {
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
