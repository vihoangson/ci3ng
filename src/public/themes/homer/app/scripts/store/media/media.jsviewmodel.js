var MediasViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
        getInit: $http.defaults.route + "media/getinit",
        getMedias: $http.defaults.route + "media/getmany",
        saveMedia: $http.defaults.route + "media/save",
        removeMedia: $http.defaults.route + "media/remove",
        saveListMedia: $http.defaults.route + "media/savelist"
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
    self.ArrSMedia = new Array();
    self.ArrMedia = new Array();
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
        InitMedias();
    };
    //--------------- For Searching -----------------------------//
    self.searchMedias = function () {
        InitMedias();
    };
    //--------------- For Item -----------------------------//
    //--------------- Model Event ----------//
    self.startAddMedia = function () {
        self.Processing.SetProcessing("Medias", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitNewMedia(data);
           }).
           error(function (data, status, headers, config) {
           });
    };
    self.startEditMedia = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditMedia = function (item) {
        SaveMedia(item);
    };
    self.cancelEditMedia = function (item) {
        if (item.Id == null || item.Id == "") {
            self.ArrMedia.splice(self.ArrMedia.indexOf(item), 1);
        } else {
            ResetMedia(item);
            item.isedit = false;
        }
    }
    self.removeMedia = function (item) {
        DeleteMedia(item);
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
        InitMedias();
    };
    //--------------- Action Function ----------//
    function FinishInitNewMedia(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToMedia(data.media);
            item.guid = data.media.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            item.editmode = "New";
            self.ArrMedia.push(item);
        }
        self.Processing.SetProcessing("Medias", false);
    }
    function InitMedias() {
        self.Processing.SetProcessing("Medias", true);
        var postParam = SetGetParam();
        var json = JSON.stringify(postParam);
        $http.post(self.GetUrl.getMedias, json).
           success(function (data, status, headers, config) {
               FinishInitMedias(data);
           }).
           error(function (data, status, headers, config) {
           });
    }
    function FinishInitMedias(data) {
        if (data.result == "Success") {
            self.ArrMedia = new Array();
            angular.forEach(data.medias, function (item) {
                self.ArrMedia.push(self.ConvertDataToMedia(item));
            });
        }
        //function run after init data
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Medias", false);
    }
    function SaveMedia(item) {
        if (ValidateMedia(item)) {
            self.Processing.SetProcessing("Medias", true);
            var json = JSON.stringify(ConvertMediaToPostObject(item));
            $http.post(self.GetUrl.saveMedia, json).
             success(function (data, status, headers, config) {
                 FinishSaveMedia(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveMedia(data) {
        if (data.result == "Success") {
            var item;
            if (data.Id != null && data.Id != 0) {
                item = $filter('filter')(self.ArrMedia, { Id: data.Id })[0];
            } else {
                item = $filter('filter')(self.ArrMedia, { guid: data.guid })[0];
            }
            if (item != null) {
                item.Id = data.Id;
                item.isedit = false;
            }
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Medias", false);
    }
    function DeleteMedia(item) {
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
                               self.ArrMedia.splice(self.ArrMedia.indexOf(item), 1);
                           }
                           self.Processing.SetProcessing("Medias", true);
                           $http.post(self.GetUrl.removeMedia, { Id: item.Id }).
                             success(function (data, status, headers, config) {
                                 if (data.result == "Success") {
                                     var item = $filter('filter')(self.ArrMedia, { Id: data.Id })[0];
                                     if (item != null) {
                                         self.ArrMedia.splice(self.ArrMedia.indexOf(item), 1);
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
                                 self.Processing.SetProcessing("Medias", false);
                             }).
                          error(function (data, status, headers, config) {
                              self.Processing.SetProcessing("Medias", false);
                          });
                       }
                   }
               });
    }
    function ConvertMediaToPostObject(item) {
        var postObject = {
                          Id: item.Id,
                          CustomerId: item.CustomerId,
                          OriginName: item.OriginName,
                          FileName: item.FileName,
                          FileExt: item.FileExt,
                          FileType: item.FileType,
                          FileSize: item.FileSize,
                          FilePath: item.FilePath,
                          FileUrl: item.FileUrl,
                          guid: item.guid
                         };
        return postObject;
    }
    function ResetMedia(item) {
        item.Id = item.oldvalue.Id;
        item.CustomerId = item.oldvalue.CustomerId;
        item.OriginName = item.oldvalue.OriginName;
        item.FileName = item.oldvalue.FileName;
        item.FileExt = item.oldvalue.FileExt;
        item.FileType = item.oldvalue.FileType;
        item.FileSize = item.oldvalue.FileSize;
        item.FilePath = item.oldvalue.FilePath;
        item.FileUrl = item.oldvalue.FileUrl;
    }
    self.ConvertDataToMedia = function (dataItem) {
        var item = new Media(
                              dataItem.Id,
                              dataItem.CustomerId,
                              dataItem.OriginName,
                              dataItem.FileName,
                              dataItem.FileExt,
                              dataItem.FileType,
                              dataItem.FileSize,
                              dataItem.FilePath,
                              dataItem.FileUrl
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
    function ValidateMedia(item) {
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

    self.startAddListMedia = function () {
        self.Processing.SetProcessing("Medias", true);
        $http.post(self.GetUrl.getInit, {}).
           success(function (data, status, headers, config) {
               FinishInitListNewMedia(data);
           }).
           error(function (data, status, headers, config) {

           });
    };
    self.startEditListMedia = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
        if (item.Id > 0) {
            item.editmode = "Edit";
        }
    };
    self.finishEditListMedia = function (item) {
        if (ValidateMedia(item)) {
            item.isedit = false;
        }
    };
    self.cancelEditListMedia = function (item) {
        if (item.editmode == "Delete") { item.editmode = ""; }
        ResetMedia(item);
        item.isedit(false);
    }
    self.removeListMedia = function (item) {
        if (item.Id == null || item.Id == 0) {
            self.ArrMedia.splice(self.ArrMedia.indexOf(item), 1);
        } else {
            swal({
                title: "Delete?",
                text: "Do you want to delete this item.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes"
            }, function (isConfirm) {
                if (isConfirm) {
                    item.editmode= "Delete";
                }
            });
        }
    };
    self.saveAllMedia = function () {
        SaveListMedia();
    };
    function FinishInitListNewMedia(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToMedia(data.media);
            item.guid = data.media.guid;
            item.editmode = "New";
            item.oldvalue = angular.copy(item);
            item.isedit = true;
            self.ArrMedia.push(item);
        }
        self.Processing.SetProcessing("Medias", false);
    }
    function SaveListMedia() {
        var postArray = new Array();
        var isOK = true;
        var nexitem = self.ArrSMedia.length;
        var numsave = self.NumItemSave;
        for (var i = nexitem; i < self.ArrMedia.length && numsave > 0; i++) {
            var item = self.ArrMedia[i];
            if (item.editmode != "Delete") {
                isOK = isOK && ValidateMedia(item);
                if (isOK) {
                    postArray.push(item);
                }
            }
            else {
                postArray.push(item);
            }
            self.ArrSMedia.push(item);
            numsave--;
        }
        if (postArray.length > 0) {
            self.Processing.SetProcessing("Medias", true);
            var json = JSON.stringify({medias:postArray});
            $http.post(self.GetUrl.saveListMedia, json).
             success(function (data, status, headers, config) {
                 FinishSaveListMedia(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function FinishSaveListMedia(data) {
        if (data.result == "Success") {
            angular.forEach(self.ArrSMedia, function (item) {
                if (item.Id == null || item.Id == "") {
                    var dataItem = $filter('filter')(data.medias, { guid: item.guid })[0];
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
        if (self.ArrMedia.length == self.ArrSMedia.length) {
            self.Processing.SetProcessing("Medias", false);
            self.ArrSMedia = new Array();
            var deleteItems = $filter("filter")(self.ArrMedia,{editmode:"Delete"});
            angular.forEach(deleteItems, function (item) {
                self.ArrMedia.splice(self.ArrMedia.indexOf(item), 1);
            });
            if (self.FFSaveAll != null) {
                self.FFSaveAll();
            }
        } else {
            SaveListMedia();
        }
    }
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
