var IncomesPageViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
       getInit: $http.defaults.route +"income/getinit",
        getIncomes: $http.defaults.route +"income/getpage",
        saveIncome: $http.defaults.route +"income/save",
        removeIncome: $http.defaults.route +"income/remove"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.Paging = new ItemPaging(1, 20, 0);
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.ArrIncome = new Array();
    //------- Init data for view model----------------------------
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.InitData = function () {
        InitIncomes();
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
    self.searchIncomes = function () {
        self.Paging.PageIndex = 1;
        InitIncomes();
    };
    self.gotoPage = function (page) {
        if (page != self.Paging.PageIndex) {
            self.Paging.PageIndex = page;
            InitIncomes();
        }
    };
    self.gotoNextPage = function () {
        if (self.Paging.PageIndex < self.Paging.TotalPages) {
            self.Paging.PageIndex = self.Paging.PageIndex + 1;
            InitIncomes();
        }
    };
    self.gotoPrevPage = function () {
        if (self.Paging.PageIndex > 1) {
            self.Paging.PageIndex = self.Paging.PageIndex - 1;
            InitIncomes();
        }
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
        self.Paging.PageIndex = 1;
        InitIncomes();
    };
    //--------------- Action Function ----------//
    function FinishInitNewIncome(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToIncome(data.income);
            item.guid = data.income.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
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
            self.Paging.ResetPaging(data.pageindex, data.pagesize, data.totalcount);
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
                if (data.Id == null || data.Id == 0) {
                    self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems + 1);
                }
                item.Id = data.income.Id;
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
            if(dataItem.Customer.CustomerId!=1) {
                item.CustomerName = dataItem.Customer.FullName;
            }else{
                item.CustomerName = dataItem.Customer.Title + '. ' + dataItem.Customer.FullName;
            }
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
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
