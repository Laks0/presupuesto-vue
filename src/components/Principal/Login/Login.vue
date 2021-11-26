<template>
	<k-form @submit="handleSubmit">
		<login-content/>

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
			// Se llama a Vuex a intentar logear
			this.$store.dispatch("login", dataItem)
				.then(res => res)
				.catch(err => {
					this.error = true;
					this.mensajeError = err.response.data;
				});
		}
	},

	data: function() {
		return {
			error: false,
			mensajeError: "",
		};
	},
}
</script>
