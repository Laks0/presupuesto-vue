<template>
	<Login v-if="!logged"/>	
	<ListaPresupuestos v-if="logged" :key="logged"/>
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

	computed: mapState(["logged"]),
}
</script>
