<template>
	<window
			@close="cerrar(tabla, p_id)"
			:title="presupuesto.nombre"
			:stage="'FULLSCREEN'"
			:maximizeButton="'false'">

			<span v-if="cargando" class="k-icon k-i-loading" style="font-size: 32px;"></span>
			<span v-if="error" class="k-icon k-i-warning" :style="{ fontSize: '32px', color: 'red' }"></span>
			<span v-if="ok" class="k-icon k-i-check" :style="{ fontSize: '32px', color: 'darkblue' }"></span>
			<span v-if="ok">Guardado</span>

		<arbol 
			:actualizar="actualizar"
			:ok="setOk"
			:error="setError"
			:cargando="setCargando"
			:customData="presupuesto"/>

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
		cerrar: Function,
	},

	data: function() {
		return {
			cargando: false,
			error: false,
			ok: false,
			tabla: [],
			p_id: 0,
		};
	},

	methods: {
		actualizar(tabla, p_id) {
			this.tabla = tabla;
			this.p_id = p_id;
		},
		setError() {
			this.cargando = false;
			this.error = true;
			this.ok = false;
		},
		setCargando() {
			this.cargando = true;
			this.error = false;
			this.ok = false;
		},
		setOk() {
			this.cargando = false;
			this.error = false;
			this.ok = true;
		},
	},
}
</script>
