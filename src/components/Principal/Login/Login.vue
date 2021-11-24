<template>
	<k-form @submit="handleSubmit">
		<login-content/>

		<p v-if="emailError">El mail no existe</p>
		<p v-if="passError">La contraseña es incorrecta</p>
		<p v-if="success">Cuenta de {{nombre}}</p>
	</k-form>
</template>

<script>
import http from "../../../http-common.js";
import bcrypt from "bcryptjs";
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
			this.emailError = false;
			this.passError = false;
			this.success = false;
			http.get(`/usuario/${dataItem.email}`)
				.then((res) => {
					if (res.data === null) {
						this.emailError = true;
						return;
					}
					if (!bcrypt.compareSync(dataItem.contraseña, res.data.contraseña)) {
						this.passError = true;
						return;
					}

					this.success = true;
					this.nombre = res.data.nombre;
				})
				.catch((err) => console.error(err));
		}
	},

	data: function() {
		return {
			emailError: false,
			passError: false,
			success: false,
			nombre: ""
		};
	},
}
</script>
