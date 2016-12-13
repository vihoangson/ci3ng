var CategorysViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "category/getinit",
        getCategorys: $http.defaults.route + "category/getmany",
        saveCategory: $http.defaults.route + "category/save",
        removeCategory: $http.defaults.route + "category/remove",
        saveListCategory: $http.defaults.route + "category/savelist"
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
    self.ArrSCategory = new Array();
    self.ArrCategory = new Array();
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
        InitCategorys();
    };
    //--------------- For Searching -----------------------------//
    self.searchCategorys = function () {
        InitCategorys();
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddCategory = function () {
        self.Processing.SetProcessing("Categorys", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewCategory(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditCategory = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditCategory = function (item) {
        SaveCategory(item);
    };
    self.cancelEditCategory = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrCategory.splice(self.ArrCategory.indexOf(item), 1);
        } else {
            ResetCategory(item);
            item.isedit = false;
        }
    }
    self.removeCategory = function (item) {
        DeleteCategory(item);
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
        InitCategorys();
    };
    //--------------- Action Function ----------//
    function FinishInitNewCategory(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToCategory(data.category);
            item.guid = data.category.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
            self.ArrCategory.push(item);
        }
        self.Processing.SetProcessing("Categorys", false);
    }
    function InitCategorys() {
        self.Processing.SetProcessing("Categorys", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getCategorys, json).
           success(function (data, status, headers, config) {
               FinishInitCategorys(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitCategorys(data) {
        if (data.result == "Success") {
            self.ArrCategory = new Array();
            angular.forEach(data.categorys, function (item) {
                self.ArrCategory.push(self.ConvertDataToCategory(item));
            });
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Categorys", false);
    }
    function SaveCategory(item) {
        if (ValidateCategory(item)) {
            self.Processing.SetProcessing("Categorys", true);
            var json = JSON.stringify(ConvertCategoryToPostObject(item));
            $http.post(self.GetUrl.saveCategory, json).
             success(function (data, status, headers, config) {
                 FinishSaveCategory(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveCategory(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrCategory, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrCategory, { guid: data.guid })[0];
            }
            if (item != null) {
                item.Id = data.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Categorys", false);
    }
    function DeleteCategory(item) {
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
                               self.ArrCategory.splice(self.ArrCategory.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Categorys", true);
                           $http.post(self.GetUrl.removeCategory, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrCategory, { Id: data.id })[0];
                                     if (item != null) {
                                         self.ArrCategory.splice(self.ArrCategory.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("Categorys", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Categorys", false);
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
    function ValidateCategory(item) {
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

    self.startAddListCategory = function () {
        self.Processing.SetProcessing("Categorys", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewCategory(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListCategory = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListCategory = function (item) {
        if (ValidateCategory(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListCategory = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetCategory(item);
        item.isedit(false);
    }
    self.removeListCategory = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrCategory.splice(self.ArrCategory.indexOf(item), 1);
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
    self.saveAllCategory = function () {
        SaveListCategory();
    };
    function FinishInitListNewCategory(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToCategory(data.category);
            item.guid = data.category.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrCategory.push(item);
        }
        self.Processing.SetProcessing("Categorys", false);
    }
    function SaveListCategory() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSCategory.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrCategory.length && numsave > 0; i++) {
            var item = self.ArrCategory[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidateCategory(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSCategory.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Categorys", true);
            var json = JSON.stringify({categorys:postArray});
            $http.post(self.GetUrl.saveListCategory, json).
             success(function (data, status, headers, config) {
                 FinishSaveListCategory(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListCategory(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSCategory, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.categorys, { guid: data.guid })[0];
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
        if (self.ArrCategory.length == self.ArrSCategory.length) {
            self.Processing.SetProcessing("Categorys", false);
            self.ArrSCategory = new Array();
            angular.forEach(self.ArrSCategory, function (item) {
                if (item.editmode == "Delete") {
                    self.ArrCategory.splice(self.ArrCategory.indexOf(item), 1);
                }
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListCategory();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
