(function() { "use strict";
/**
 * @author ntd1712
 */
angular.module("inspinia").controller("AuditController", Anonymous);

function Anonymous($scope, AuditRepository, AbstractController) {
    function AuditController() {
        this.__super__.constructor.apply(this, arguments);
    }
    extend(AuditController, AbstractController);

    return AuditController.newInstance(arguments);
}

})();