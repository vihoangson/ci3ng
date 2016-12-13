var ProductsPageViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
       getInit: $http.defaults.route +"product/getinit",
        getProducts: $http.defaults.route +"product/getpage",
        saveProduct: $http.defaults.route +"product/save",
        removeProduct: $http.defaults.route +"product/remove"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.Paging = new ItemPaging(1, 20, 0);
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.ArrProduct = new Array();
    self.ArrSProduct = new Array();
    //------- Init data for view model----------------------------
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.InitData = function () {
        InitProducts();
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
    self.searchProducts = function () {
        self.Paging.PageIndex = 1;
        InitProducts();
    };
    self.gotoPage = function (page) {
        if (page != self.Paging.PageIndex) {
            self.Paging.PageIndex = page;
            InitProducts();
        }
    };
    self.gotoNextPage = function () {
        if (self.Paging.PageIndex < self.Paging.TotalPages) {
            self.Paging.PageIndex = self.Paging.PageIndex + 1;
            InitProducts();
        }
    };
    self.gotoPrevPage = function () {
        if (self.Paging.PageIndex > 1) {
            self.Paging.PageIndex = self.Paging.PageIndex - 1;
            InitProducts();
        }
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddProduct = function () {
        self.Processing.SetProcessing("Products", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewProduct(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditProduct = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditProduct = function (item) {
        SaveProduct(item);
    };
    self.cancelEditProduct = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrProduct.splice(self.ArrProduct.indexOf(item), 1);
        } else {
            ResetProduct(item);
            item.isedit = false;
        }
    }
    self.removeProduct = function (item) {
        DeleteProduct(item);
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
        InitProducts();
    };
    //--------------- Action Function ----------//
    function FinishInitNewProduct(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToProduct(data.product);
            item.guid = data.product.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrProduct.push(item);
        }
        self.Processing.SetProcessing("Products", false);
    }
    function InitProducts() {
        self.Processing.SetProcessing("Products", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getProducts, json).
           success(function (data, status, headers, config) {
               FinishInitProducts(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitProducts(data) {
        if (data.result == "Success") {
            self.ArrProduct = new Array();
            angular.forEach(data.products, function (item) {
                self.ArrProduct.push(self.ConvertDataToProduct(item));
            });
            self.Paging.ResetPaging(data.pageindex, data.pagesize, data.totalcount);
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Products", false);
    }
    function SaveProduct(item) {
        if (ValidateProduct(item)) {
            self.Processing.SetProcessing("Products", true);
            var json = JSON.stringify(ConvertProductToPostObject(item));
            $http.post(self.GetUrl.saveProduct, json).
             success(function (data, status, headers, config) {
                 FinishSaveProduct(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveProduct(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrProduct, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrProduct, { guid: data.guid })[0];
            }
            if (item != null) {
                if (data.Id == null || data.Id == 0) {
                    self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems + 1);
                }
                item.Id = data.product.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Products", false);
    }
    function DeleteProduct(item) {
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
                               self.ArrProduct.splice(self.ArrProduct.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Products", true);
                           $http.post(self.GetUrl.removeProduct, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrProduct, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrProduct.splice(self.ArrProduct.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("Products", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Products", false);
                          });
                       }
                   }
               });
    }
    function ConvertProductToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          Type: item.Type,
                          Code: item.Code,
                          Name: item.Name,
                          Summary: item.Summary,
                          Description: item.Description,
                          Image: item.Image,
                          Thumbnail: item.Thumbnail,
                          QuantityPerUnit: item.QuantityPerUnit,
                          SalePrice: item.SalePrice,
                          UnitPrice: item.UnitPrice,
                          UnitsInStock: item.UnitsInStock,
                          UnitsOnOrder: item.UnitsOnOrder,
                          Position: item.Position,
                          CategoryId: item.CategoryId,
                          guid: item.guid
                         };
        return postObject;
    }
    function ResetProduct(item) {
        item.Id = item.oldvalue.Id;
        item.Type = item.oldvalue.Type;
        item.Code = item.oldvalue.Code;
        item.Name = item.oldvalue.Name;
        item.Summary = item.oldvalue.Summary;
        item.Description = item.oldvalue.Description;
        item.Image = item.oldvalue.Image;
        item.Thumbnail = item.oldvalue.Thumbnail;
        item.QuantityPerUnit = item.oldvalue.QuantityPerUnit;
        item.SalePrice = item.oldvalue.SalePrice;
        item.UnitPrice = item.oldvalue.UnitPrice;
        item.UnitsInStock = item.oldvalue.UnitsInStock;
        item.UnitsOnOrder = item.oldvalue.UnitsOnOrder;
        item.Position = item.oldvalue.Position;
        item.CategoryId = item.oldvalue.CategoryId;
    }
    self.ConvertDataToProduct = function (dataItem) {
        var item = new Product(
                              dataItem.Id,
                              dataItem.Type,
                              dataItem.Code,
                              dataItem.Name,
                              dataItem.Summary,
                              dataItem.Description,
                              dataItem.Image,
                              dataItem.Thumbnail,
                              dataItem.QuantityPerUnit,
                              dataItem.SalePrice,
                              dataItem.UnitPrice,
                              dataItem.UnitsInStock,
                              dataItem.UnitsOnOrder,
                              dataItem.Position,
                              dataItem.CategoryId
                            );
        item.CategoryName = dataItem.Category.Name;
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
    function ValidateProduct(item) {
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
