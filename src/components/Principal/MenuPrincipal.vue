<template>
	<tabstrip :selected="selected" @select="onSelect">
		<tabstrip-tab :title="'Usuario'">
			USUARIO	
		</tabstrip-tab>
		<tabstrip-tab :title="'Presupuestos'">
			PRESUPUESTO
		</tabstrip-tab>
	</tabstrip>
</template>

<script>
import { TabStrip, TabStripTab } from "@progress/kendo-vue-layout";

export default {
	name: "MenuPrincipal",
	components: {
		"tabstrip": TabStrip,
		"tabstrip-tab": TabStripTab
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
