<template>
	<k-form @submit="handleSubmit" :style="{ maxWidth: '400px' }">
		<login-content :cargando="cargando"/>

			<p v-if="error">{{mensajeError}}</p>
	</k-form>
</template>

<script>
import { Form } from "@progress/kendo-vue-form";
import LoginContent from "./LoginContent.vue";

export default {
	name: "Login",
	components: {
		"k-form": Form,
		"login-content": LoginContent,
	},
	methods: {
		// En sumbit de loginForm
		handleSubmit (dataItem) {
			this.cargando = true;
			// Se llama a Vuex a intentar logear
			this.$store.dispatch("login", dataItem)
				.then(res => res)
				.catch(err => {
					this.cargando = false;
					this.error = true;
					this.mensajeError = err.response.data;
				});
		}
	},

	data: function() {
		return {
			error: false,
			mensajeError: "",
			cargando: false
		};
	},
}
</script>
