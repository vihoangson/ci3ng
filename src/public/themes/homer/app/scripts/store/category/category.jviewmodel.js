var CategoryViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getCategory: $http.defaults.route + "category/getbyid",
        saveCategory: $http.defaults.route + "category/save",
        removeCategory: $http.defaults.route + "category/remove",
        getInit: $http.defaults.route + "category/getinit"
    };
    self.Id = null;
    self.Category = null;
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
        InitCategory();
    };
    self.startEditCategory = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditCategory = function (item) {
        SaveCategory(item);
    };
    self.cancelEditCategory = function (item) {
        ResetCategory(item);
        item.isedit = false;
    };
    self.removeCategory = function (item) {
        DeleteCategory(item);
    };
    function InitCategory() {
        self.Processing.SetProcessing("Category", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getCategory, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitCategory(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewCategory(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitCategory(data) {
        if (data.result == "Success") {
            self.Category = self.ConvertDataToCategory(data.category);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Category", false);
    }
    function FinishInitNewCategory(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToCategory(data.category);
            item.guid = data.category.guid;
            self.Category = item;
            self.Category.allowedit = true;
            self.Category.allowremove = true;
            self.Category.oldvalue = angular.copy(self.Category);
            self.Category.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Category", false);
    }
    function SaveCategory(item) {
        if (ValidateCategory(item)) {
            self.Processing.SetProcessing("Category", true);
            var json = JSON.stringify(ConvertCategoryToPostObject(item));
            $http.post(self.GetUrl.saveCategory, json).
             success(function (data, status, headers, config) {
                 FinishSaveCategory(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateCategory(item) {
        return true;
    }
    function FinishSaveCategory(data) {
        if (data.result == "Success") {
            self.Category.Id = data.category.Id;
            self.Id = data.category.Id;
            self.Category.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Category", false);
    }
    function DeleteCategory(item) {
        self.Processing.SetProcessing("Category", true);
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
                        $http.post(self.GetUrl.removeCategory, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Category", false);
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
                             self.Processing.SetProcessing("Category", false);
                         });
                    }
                }
            });
    }
    function ConvertCategoryToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          Name: item.Name,
                          Description: item.Description,
                          Left: item.Left,
                          Right: item.Right,
                          Depth: item.Depth,
                          ParentId: item.ParentId,
                          guid: item.guid
                         };
        return postObject;
    }
    function ResetCategory(item) {
        item.Id = item.oldvalue.Id;
        item.Name = item.oldvalue.Name;
        item.Description = item.oldvalue.Description;
        item.Left = item.oldvalue.Left;
        item.Right = item.oldvalue.Right;
        item.Depth = item.oldvalue.Depth;
        item.ParentId = item.oldvalue.ParentId;
    }
    self.ConvertDataToCategory = function (dataItem) {
        var item = new Category(
                              dataItem.Id,
                              dataItem.Name,
                              dataItem.Description,
                              dataItem.Left,
                              dataItem.Right,
                              dataItem.Depth,
                              dataItem.ParentId
                            );
        return item;
    };
}
