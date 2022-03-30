<template>
	<div v-if="!registrandose">
		<h1>Iniciar Sesión</h1>
		<k-form @submit="handleSubmit" :style="{ maxWidth: '400px' }">
			<login-content :cargando="cargando"/>
		</k-form>

		<p v-if="error">{{mensajeError}}</p>

		<k-button @click="toggleRegistrandose" look="flat">Registrarse</k-button>
	</div>

	<div v-if="registrandose">
		<h1>Registrarse</h1>
		<k-form @submit="handleRegistrarse" :style="{ maxWidth: '400px' }">
			<login-content :registrandose="true" :cargando="cargando"/>
		</k-form>

		<p v-if="error">{{mensajeError}}</p>

		<k-button @click="toggleRegistrandose" look="flat">Iniciar Sesión</k-button>
	</div>
</template>

<script>
import http from "../../../http-common.js";
import { Button } from "@progress/kendo-vue-buttons";
import { Form } from "@progress/kendo-vue-form";
import LoginContent from "./LoginContent.vue";

export default {
	name: "Login",
	components: {
		"k-form": Form,
		"login-content": LoginContent,
		"k-button": Button,
	},
	methods: {
		// En sumbit de loginForm
		handleSubmit (dataItem) {
			this.cargando = true;
			// Se llama a Vuex a intentar logear
			this.$store.dispatch("login", dataItem) // El contacto con la API y todo el Login se hace desde Vuex
				.then(res => res)
				.catch(err => {
					this.cargando = false;
					this.error = true;
					this.mensajeError = err.response.data;
				});
		},

		// En sumbit de la forma de registro
		handleRegistrarse (dataItem) {
			this.cargando = true;
			// Se postea el usuario
			http.post("/usuario", {
				nombre: dataItem.nombre,
				email: dataItem.email,
				contraseña: dataItem.contraseña,
			}).then(() => {
				this.cargando = false;
				// En caso exitoso, se logea con Vuex
				this.$store.dispatch("login", dataItem)
					.then(res => res)
					.catch(err => {
						this.error = true;
						this.mensajeError = err.response.data;
					});
			}).catch(err => {
				this.cargando = false;
				this.error = true;
				this.mensajeError = err.response.data;
			});
		},

		toggleRegistrandose () {
			this.error = false;
			this.registrandose = !this.registrandose;
		},
	},

	data: function() {
		return {
			error: false,
			mensajeError: "",
			cargando: false,
			registrandose: false,
		};
	},
}
</script>
