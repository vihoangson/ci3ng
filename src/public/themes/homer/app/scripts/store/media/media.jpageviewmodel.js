var MediasPageViewModel = function ($http, $filter) {
    var self = this;
    self.GetUrl = {
       getInit: $http.defaults.route +"media/getinit",
        getMedias: $http.defaults.route +"media/getpage",
        saveMedia: $http.defaults.route +"media/save",
        removeMedia: $http.defaults.route +"media/remove"
    };
    self.Processing = null;
    self.Transition = null;
    self.FFInit = null;
    self.FFSave = null;
    self.FFDelete = null;
    self.Paging = new ItemPaging(1, 20, 0);
    self.SortedField = null;
    self.ArrSearchParam = new Array();
    self.ArrMedia = new Array();
    //------- Init data for view model----------------------------
    self.InitModel = function (transition, processing) {
        self.Transition = transition;
        self.Processing = processing;
    };
    self.InitData = function () {
        InitMedias();
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
    self.searchMedias = function () {
        self.Paging.PageIndex = 1;
        InitMedias();
    };
    self.gotoPage = function (page) {
        if (page != self.Paging.PageIndex) {
            self.Paging.PageIndex = page;
            InitMedias();
        }
    };
    self.gotoNextPage = function () {
        if (self.Paging.PageIndex < self.Paging.TotalPages) {
            self.Paging.PageIndex = self.Paging.PageIndex + 1;
            InitMedias();
        }
    };
    self.gotoPrevPage = function () {
        if (self.Paging.PageIndex > 1) {
            self.Paging.PageIndex = self.Paging.PageIndex - 1;
            InitMedias();
        }
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
        self.Paging.PageIndex = 1;
        InitMedias();
    };
    //--------------- Action Function ----------//
    function FinishInitNewMedia(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToMedia(data.media);
            item.guid = data.media.guid;
            item.oldvalue = angular.copy(item);
            item.isedit = true;
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
            self.Paging.ResetPaging(data.pageindex, data.pagesize, data.totalcount);
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
                if (data.Id == null || data.Id == 0) {
                    self.Paging.ResetPaging(self.Paging.PageIndex, self.Paging.PageSize, self.Paging.TotalItems + 1);
                }
                item.Id = data.media.Id;
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
    //--------------- End Action Function ----------//
    //--------------- End For item -----------------------------//
};
