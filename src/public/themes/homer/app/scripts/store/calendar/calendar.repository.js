(function() { "use strict";
/**
 * @author ntd1712
 */
chaos.service("CalendarRepository", Anonymous);

function Anonymous(CalendarModel, AbstractRepository) {
    function CalendarRepository() {
        this.__super__.constructor.apply(this, arguments);
    }
    extend(CalendarRepository, AbstractRepository);

    return CalendarRepository.newInstance(arguments);
}

})();