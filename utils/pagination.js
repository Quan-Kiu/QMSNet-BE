modules.exports = class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating(isData) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 20;
        const skip = (page - 1) * limit;
        if (isData) {
            this.query = this.query.splice(skip, limit);
        } else {
            this.query = this.query.skip(skip).limit(limit);
        }
        return this;
    }
}