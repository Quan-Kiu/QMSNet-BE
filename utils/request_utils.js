const getFilter = (req) => req?.body?.filter?.reduce((prev, next) => {
    if (next.operator === 'LIKE') {

        // if (next.type.includes('.')) {
        //     const filterType = next.type.split('.');
        //     return {
        //         ...prev,
        //         [filterType]: next.name
        //     }
        // }

        return {
            ...prev,
            [next.type]: {
                $regex: next.name,
                $options: 'i'
            }
        }
    } else if (next.operator === 'EQUAL') {

        // if (next.type.includes('.')) {
        //     const filterType = next.type.split('.');
        //     return {
        //         ...prev,
        //         [filterType[0]]: {
        //             $elemMatch:
        //             {
        //                 [filterType[1]]: next.name
        //             }
        //         }
        //     }
        // }

        return {
            ...prev,
            [next.type]: next.name
        }
    } else if (next.operator === 'IN') {
        return {
            ...prev,
            [next.type]: {
                $gte: new Date(next.name?.start),
                $lt: next.name?.end ? new Date(next.name?.end) : new Date()
            }
        }
    }


}, {})


module.exports = {
    getFilter
}