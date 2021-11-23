<template>
	<k-form @submit="handleSubmit">
		<login-content/>
	</k-form>
</template>

<script>
import http from "../../../http-common.js";
//import bcrypt from "bcrypt";
import { Form } from "@progress/kendo-vue-form";
import LoginContent from "./LoginContent.vue";

export default {
	name: "Login",
	components: {
		"k-form": Form,
		"login-content": LoginContent,
	},
	methods: {
		handleSubmit (dataItem) {
			http.get(`/usuario/${dataItem.email}`)
				.then((res) => {
					if (res.data === null) {
						console.log("El mail no existe");
						return;
					}
//					bcrypt.compare(dataItem.data.contraseña, res.data.contraseña, (err, comp) => {
//						if (err) {
//							console.error(err);
//							return;
//						}
//						console.log(comp ? dataItem.data.nombre : "Contraseña incorrecta");
//					})
				})
				.catch((err) => console.error(err));
		}
	}
}
</script>
