<template>
	<tabstrip :selected="selected" @select="onSelect" :tabPosition="'left'" :style="{ height: '98vh' }">
	<tabstrip-tab :title="'Usuario'" >
		<InfoUsuario v-if="logged"/>
		<Login v-else/>	
	</tabstrip-tab>
		<tabstrip-tab :title="'Presupuesto'" :disabled="!logged" :key="logged">
			<ListaPresupuestos/>
		</tabstrip-tab>
	</tabstrip>
</template>

<script>
import { mapState } from "vuex";
import { TabStrip, TabStripTab } from "@progress/kendo-vue-layout";
import Login from "./Login/Login.vue";
import InfoUsuario from "./InfoUsuario.vue";
import ListaPresupuestos from "../Presupuestos/ListaPresupuestos.vue";

export default {
	name: "MenuPrincipal",
	components: {
		"tabstrip": TabStrip,
		"tabstrip-tab": TabStripTab,
		Login: Login,
		InfoUsuario: InfoUsuario,
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
