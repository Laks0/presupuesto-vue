<template>
	<window
			@close="toggle"
			:title="presupuesto.nombre"
			:stage="'FULLSCREEN'"
			:maximizeButton="false">

		<arbol :customData="presupuesto.tabla"/>

	</window>
</template>

<script>
import { Window } from "@progress/kendo-vue-dialogs";
import Presupuesto from "./Presupuesto.vue";

export default {
	components: {
		window: Window,
		arbol: Presupuesto,
	},

	props: {
		presupuesto: Object,
		toggle: Function,
	},
}
</script>
