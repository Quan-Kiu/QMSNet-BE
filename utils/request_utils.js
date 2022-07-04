const getFilter = (req) => req?.body?.filter?.reduce((prev, next) => {
    if (next.operator === 'LIKE') {

        return {
            ...prev,
            [next.type]: {
                $regex: next.name,
                $options: 'i'
            }
        }
    } else if (next.operator === 'EQUAL') {

        return {
            ...prev,
            [next.type]: next.name
        }
    }

}, {})


module.exports = {
    getFilter
}