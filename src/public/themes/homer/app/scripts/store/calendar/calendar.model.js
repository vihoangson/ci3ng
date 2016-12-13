(function() { "use strict";
/**
 * @author ntd1712
 */
chaos.service("CalendarModel", Anonymous);

function Anonymous(AbstractModel) {
    function CalendarModel(data) {
        this.__super__.constructor.apply(this, [data, CalendarModel.getFields()]);
    }
    extend(CalendarModel, AbstractModel);

    /**
     * @returns {string}
     */
    CalendarModel.getRoute = function() {
        return "calendar";
    };

    /**
     * @return {Object[]}
     */
    CalendarModel.getFields = function() {
        return [{
            data: "Id",
            value: 0,
            visible: false
        },{
            data: "Username",
            value: "",
            title: "Username",
            class: "col-xs-2"
        },{
            data: "Action",
            value: "",
            title: "Action",
            class: "col-xs-2"
        },{
            data: "Information",
            value: "",
            title: "Information",
            class: "text-wrap",
            sortable: false
        },{
            data: "Type",
            value: "",
            visible: false
        },{
            data: "IpAddress",
            value: "",
            visible: false
        },{
            data: "Request",
            value: "",
            visible: false
        },{
            data: "Params",
            value: "",
            visible: false
        },{
            data: "Referrer",
            value: "",
            visible: false
        },{
            data: "CreatedAt",
            value: "",
            title: "Date",
            class: "col-xs-2",
            render: function(data) {
                return (data && data.date) || data;
            }
        }];
    };

    return CalendarModel;
}

})();