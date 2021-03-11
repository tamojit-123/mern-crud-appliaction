const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
const conn = mongoose.Collection;

const uploadSchema = new mongoose.Schema({
    imagename: String,

});

const uploadModel = mongoose.model('uploadimage', uploadSchema);
module.exports = uploadModel;