const createRes = {
    success:  (message,data)=>({message,data,success:true}),
    error: (message,status=400)=>({
        message,status
})
}

module.exports = createRes;