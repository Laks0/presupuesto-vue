<template>
	<tabstrip :selected="selected" @select="onSelect">
		<tabstrip-tab :title="'Usuario'">
			<Login/>	
		</tabstrip-tab>
		<tabstrip-tab :title="'Presupuestos'">
			PRESUPUESTO
		</tabstrip-tab>
	</tabstrip>
</template>

<script>
import { TabStrip, TabStripTab } from "@progress/kendo-vue-layout";
import Login from "./Login/Login.vue";

export default {
	name: "MenuPrincipal",
	components: {
		"tabstrip": TabStrip,
		"tabstrip-tab": TabStripTab,
		Login: Login,
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
	}
}
</script>
