(function() { "use strict";
/**
 * @author ntd1712
 */
chaos.service("BlogModel", Anonymous);

function Anonymous(AbstractModel) {
    function BlogModel(data) {
        this.__super__.constructor.apply(this, [data, BlogModel.getFields()]);
    }
    extend(BlogModel, AbstractModel);

    /**
     * @returns {string}
     */
    BlogModel.getRoute = function() {
        return "kintai/blog";
    };

    /**
     * @return {Object[]}
     */
    BlogModel.getFields = function() {
        return [{
            data: "Id",
            value: 0,
            visible: false
        },{
            data: "Name",
            title: t("NAME"),
            value: "",
            sortable: false
        }];
    };

    return BlogModel;
}

})();