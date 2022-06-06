const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
}
const reqNumber = {
    type: Number,
    required: true,
}

const tagCountSchema = mongoose.Schema({
    _id: reqString,
    tagCount: reqNumber,
})
module.exports = mongoose.model('tagCounts', tagCountSchema,)
