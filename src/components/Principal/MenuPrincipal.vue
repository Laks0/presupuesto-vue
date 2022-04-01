<template>
	<Login v-if="!logged && active"/>
	<ListaPresupuestos v-if="logged && active" :key="logged"/>
</template>

<script>
import { mapState } from "vuex";
import Login from "./Login/Login.vue";
import ListaPresupuestos from "../Presupuestos/ListaPresupuestos.vue";

export default {
	name: "MenuPrincipal",
	components: {
		Login: Login,
		ListaPresupuestos: ListaPresupuestos,
	},

	data: function () {
		return {
			selected: 0,
		};
	},

	methods: {
		onSelect: function (ev) {
			this.selected = ev.selected;
		}
	},

	computed: mapState(["logged", "active"]),

	beforeMount: function () {
		this.$store.dispatch("checkCookie")
			.then(res => res)
			.catch(err => {
				console.error(err);
			});
	},
}
</script>
