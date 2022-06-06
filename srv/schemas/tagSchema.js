const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
}
const tagSchema = mongoose.Schema({
    tagAuthor: reqString,
    tagName: reqString,
    tagColour: reqString,
    tagDesciption: reqString
})
module.exports = mongoose.model('tags', tagSchema)
