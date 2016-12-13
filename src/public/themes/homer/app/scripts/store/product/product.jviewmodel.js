var ProductViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getProduct: $http.defaults.route + "product/getbyid",
        saveProduct: $http.defaults.route + "product/save",
        removeProduct: $http.defaults.route + "product/remove",
        getInit: $http.defaults.route + "product/getinit"
    };
    self.Id = null;
    self.Product = null;
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
        InitProduct();
    };
    self.startEditProduct = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditProduct = function (item) {
        SaveProduct(item);
    };
    self.cancelEditProduct = function (item) {
        ResetProduct(item);
        item.isedit = false;
    };
    self.removeProduct = function (item) {
        DeleteProduct(item);
    };
    function InitProduct() {
        self.Processing.SetProcessing("Product", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getProduct, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitProduct(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewProduct(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitProduct(data) {
        if (data.result == "Success") {
            self.Product = self.ConvertDataToProduct(data.product);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Product", false);
    }
    function FinishInitNewProduct(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToProduct(data.product);
            item.guid = data.product.guid;
            self.Product = item;
            self.Product.allowedit = true;
            self.Product.allowremove = true;
            self.Product.oldvalue = angular.copy(self.Product);
            self.Product.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Product", false);
    }
    function SaveProduct(item) {
        if (ValidateProduct(item)) {
            self.Processing.SetProcessing("Product", true);
            var json = JSON.stringify(ConvertProductToPostObject(item));
            $http.post(self.GetUrl.saveProduct, json).
             success(function (data, status, headers, config) {
                 FinishSaveProduct(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateProduct(item) {
        return true;
    }
    function FinishSaveProduct(data) {
        if (data.result == "Success") {
            self.Product.Id = data.product.Id;
            self.Id = data.product.Id;
            self.Product.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Product", false);
    }
    function DeleteProduct(item) {
        self.Processing.SetProcessing("Product", true);
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
                        $http.post(self.GetUrl.removeProduct, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Product", false);
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
                             self.Processing.SetProcessing("Product", false);
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
}
