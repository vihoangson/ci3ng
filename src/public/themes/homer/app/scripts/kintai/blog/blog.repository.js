(function() { "use strict";
/**
 * @author ntd1712
 */
chaos.service("BlogRepository", Anonymous);

function Anonymous(BlogModel, AbstractRepository) {
    function BlogRepository() {
        this.__super__.constructor.apply(this, arguments);
    }
    extend(BlogRepository, AbstractRepository);

    return BlogRepository.newInstance(arguments);
}

})();