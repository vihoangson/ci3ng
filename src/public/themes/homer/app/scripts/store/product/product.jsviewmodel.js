var ProductsViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "product/getinit",
        getProducts: $http.defaults.route + "product/getmany",
        saveProduct: $http.defaults.route + "product/save",
        removeProduct: $http.defaults.route + "product/remove",
        saveListProduct: $http.defaults.route + "product/savelist"
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
    self.ArrSProduct = new Array();
    self.ArrProduct = new Array();
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
        InitProducts();
    };
    //--------------- For Searching -----------------------------//
    self.searchProducts = function () {
        InitProducts();
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
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
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
        InitProducts();
    };
    //--------------- Action Function ----------//
    function FinishInitNewProduct(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToProduct(data.product);
            item.guid = data.product.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
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
                item.Id = data.Id;
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

    self.startAddListProduct = function () {
        self.Processing.SetProcessing("Products", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewProduct(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListProduct = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListProduct = function (item) {
        if (ValidateProduct(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListProduct = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetProduct(item);
        item.isedit(false);
    }
    self.removeListProduct = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrProduct.splice(self.ArrProduct.indexOf(item), 1);
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
    self.saveAllProduct = function () {
        SaveListProduct();
    };
    function FinishInitListNewProduct(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToProduct(data.product);
            item.guid = data.product.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrProduct.push(item);
        }
        self.Processing.SetProcessing("Products", false);
    }
    function SaveListProduct() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSProduct.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrProduct.length && numsave > 0; i++) {
            var item = self.ArrProduct[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidateProduct(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSProduct.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Products", true);
            var json = JSON.stringify({products:postArray});
            $http.post(self.GetUrl.saveListProduct, json).
             success(function (data, status, headers, config) {
                 FinishSaveListProduct(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListProduct(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSProduct, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.products, { guid: data.guid })[0];
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
        if (self.ArrProduct.length == self.ArrSProduct.length) {
            self.Processing.SetProcessing("Products", false);
            self.ArrSProduct = new Array();
            var deleteItems = $filter("filter")(self.ArrProduct,{editmode:"Delete"});
            angular.forEach(deleteItems, function (item) {
                self.ArrProduct.splice(self.ArrProduct.indexOf(item), 1);
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListProduct();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
