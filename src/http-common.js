require("dotenv").config();
import axios from "axios";

export default axios.create({
	baseURL: process.env.VUE_APP_API,
	headers: {
		"Content-type": "application/json",
		"Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
	}
});
