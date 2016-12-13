var MediaViewModel = function ($http,$filter) {
    var self = this;
    self.GetUrl = {
        getMedia: $http.defaults.route + "media/getbyid",
        saveMedia: $http.defaults.route + "media/save",
        removeMedia: $http.defaults.route + "media/remove",
        getInit: $http.defaults.route + "media/getinit"
    };
    self.Id = null;
    self.Media = null;
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
        InitMedia();
    };
    self.startEditMedia = function (item) {
        item.oldvalue = angular.copy(item);
        item.isedit = true;
    };
    self.finishEditMedia = function (item) {
        SaveMedia(item);
    };
    self.cancelEditMedia = function (item) {
        ResetMedia(item);
        item.isedit = false;
    };
    self.removeMedia = function (item) {
        DeleteMedia(item);
    };
    function InitMedia() {
        self.Processing.SetProcessing("Media", true);
        if (self.Id != null && self.Id != 0) {
            $http.post(self.GetUrl.getMedia, { Id: self.Id }).
              success(function (data, status, headers, config) {
                  FinishInitMedia(data);
              }).
              error(function (data, status, headers, config) {
              });
        } else {
            $http.post(self.GetUrl.getInit, {}).
              success(function (data, status, headers, config) {
                  FinishInitNewMedia(data);
              }).
              error(function (data, status, headers, config) {
              });
        }
    }
    function FinishInitMedia(data) {
        if (data.result == "Success") {
            self.Media = self.ConvertDataToMedia(data.media);
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Media", false);
    }
    function FinishInitNewMedia(data) {
        if (data.result == "Success") {
            var item = self.ConvertDataToMedia(data.media);
            item.guid = data.media.guid;
            self.Media = item;
            self.Media.allowedit = true;
            self.Media.allowremove = true;
            self.Media.oldvalue = angular.copy(self.Media);
            self.Media.isedit = true;
        }
        if (self.FFInit != null) self.FFInit();
        self.Processing.SetProcessing("Media", false);
    }
    function SaveMedia(item) {
        if (ValidateMedia(item)) {
            self.Processing.SetProcessing("Media", true);
            var json = JSON.stringify(ConvertMediaToPostObject(item));
            $http.post(self.GetUrl.saveMedia, json).
             success(function (data, status, headers, config) {
                 FinishSaveMedia(data);
             }).
             error(function (data, status, headers, config) {
             });
        }
    }
    function ValidateMedia(item) {
        return true;
    }
    function FinishSaveMedia(data) {
        if (data.result == "Success") {
            self.Media.Id = data.media.Id;
            self.Id = data.media.Id;
            self.Media.isedit = false;
        } else {
            swal({
                title: "Error?",
                text: "Delete fail.",
                type: "error",
                showCancelButton: false
            });
        }
        if (self.FFSave != null) self.FFSave();
        self.Processing.SetProcessing("Media", false);
    }
    function DeleteMedia(item) {
        self.Processing.SetProcessing("Media", true);
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
                        $http.post(self.GetUrl.removeMedia, { Id: item.Id }).
                        success(function (data, status, headers, config) {
                            self.Processing.SetProcessing("Media", false);
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
                             self.Processing.SetProcessing("Media", false);
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
}
