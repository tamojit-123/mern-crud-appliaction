const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
const conn = mongoose.Collection;

const employeeSchema = new mongoose.Schema({
	name: String,
	email: String,
	phone: Number,
	password: String,
	image: String,
});

const employeeModel = mongoose.model('Employee', employeeSchema);
module.exports=employeeModel;