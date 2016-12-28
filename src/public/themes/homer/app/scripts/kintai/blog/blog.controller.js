(function() { "use strict";
/**
 * @author ntd1712
 */
angular.module("homer").controller("BlogController", Anonymous);

function Anonymous($scope, BlogRepository, AbstractController) {
    function BlogController() {
        this.__super__.constructor.apply(this, arguments);
    }
    extend(BlogController, AbstractController);

    return BlogController.newInstance(arguments);
}

})();