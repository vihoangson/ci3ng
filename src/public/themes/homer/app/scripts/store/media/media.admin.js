(function(angular) {
angular
    .module("homer")
    .controller("AdminMediaController", Anonymous);
    function Anonymous($scope, $injector,$filter, AbstractController) {
        function AdminMediaController() {
            AbstractController.apply(this, arguments.callee.caller.arguments);
        }
        AdminMediaController.prototype = Object.create(AbstractController.prototype);
        AdminMediaController.prototype.constructor = AdminMediaController;

        AdminMediaController.prototype.initData = function() {
            $scope.Processing = null;
            $scope.Transition = null;
            $scope.MediasVM = null;
            $scope.MediaVM = null;
            $scope.CustomersVM = null;
            $scope.InitData = function () {
                //define view model
                $scope.Processing = $injector.instantiate(ModelProcessing);
                $scope.Transition = $injector.instantiate(ModelTransition);

                var mediasvm = $injector.instantiate(MediasPageViewModel);
                mediasvm.InitModel($scope.Transition, $scope.Processing);
                $scope.MediasVM = mediasvm;

                var mediavm = $injector.instantiate(MediaViewModel);
                mediavm.InitModel($scope.Transition, $scope.Processing);
                $scope.MediaVM = mediavm;

                var customersvm = $injector.instantiate(CustomersViewModel);
                customersvm.InitModel($scope.Transition, $scope.Processing);
                $scope.CustomersVM = customersvm;
                $scope.CustomersVM.InitData();
                //set view model relation
                //int main view model

                $scope.MediasVM.InitData();
            };
            $scope.removeMedia = function (item) {
                $scope.MediasVM.removeMedia(item);
            };
            $scope.checkValMedia = function (casename, item) {
                if (casename != "All") {
                    //logic for validate form
                    ValMedia(casename, item);
                    //end logic
                } else {
                    item.valmanager.Reset();
                    angular.forEach(item.valmanager.ArrValidateField, function (valfield) {
                        ValMedia(valfield.Name, item);
                    });
                }
            }
            function ValMedia(fieldname, item) {
                switch (fieldname) {
                }
            }
            $scope.checkEditingMedia = function () {
                var isedit = false;
                angular.forEach($scope.MediasVM.ArrMedia, function (item) {
                    if (item.isedit) {
                        if (isedit == false) isedit = true;
                    }
                });
                return isedit;
            };
            window.onbeforeunload = function () {
                if ($scope.checkEditingMedia()) {
                    return "Do you wish to leave this page? Any unsaved data will be deleted.";
                }
            };
            $scope.startAddPopupMedia = function (item) {
                $scope.MediaVM.Media = null;
                $scope.MediaVM.SetId(0);

                $scope.MediaVM.SetFFInit(function() {
                    $('#popupMedia').on('hide.bs.modal', function () {
                        if ($scope.MediaVM.Media.isedit == true) {
                            $scope.MediaVM.Media.isedit = false;
                            $scope.MediaVM.cancelEditMedia($scope.MediaVM.Media);
                        }
                    });
                    $("#popupMedia").modal("show");
                });
                $scope.MediaVM.InitData();
            };
            $scope.startEditPopupMedia = function (item) {
                $scope.MediaVM.Media = item;
                $scope.MediaVM.startEditMedia($scope.MediaVM.Media);
                $('#popupMedia').on('hide.bs.modal', function () {
                    if ($scope.MediaVM.Media.isedit == true) {
                        $scope.MediaVM.cancelEditMedia($scope.MediaVM.Media);
                    }
                    if(!$scope.$$phase) { $scope.$apply();}
                });
                $("#popupMedia").modal("show");
            };
            $scope.finishEditPopupMedia = function () {
                $scope.checkValMedia("All", $scope.MediaVM.Media);
                if ($scope.MediaVM.Media.valmanager.IsValid) {
                    $scope.MediaVM.SetFFSave(function () {
                        var item = $filter('filter')($scope.MediasVM.ArrMedia, { Id: $scope.MediaVM.Media.Id })[0];
                        if(item==null){
                            $scope.MediasVM.ArrMedia.push($scope.MediaVM.Media);
                            $scope.MediasVM.Paging.TotalItems +=1;
                        }
                        $("#popupMedia").modal("hide");
                    });
                    $scope.MediaVM.finishEditMedia($scope.MediaVM.Media);
                } else {
                    $('.validateinput:first').focus();
                }
            };
            
            
            $scope.InitData();
        };

        return new AdminMediaController();
    }
})(angular);
