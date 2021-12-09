<template>
	<window
			@close="cerrar(tabla, p_id)"
			:title="presupuesto.nombre"
			:stage="windowStage"
			@stagechange="stagechange"
			:minHeight="700"
			:initialHeight="700"
			:minWidth="800"
			:initialWidth="800">

		<span v-if="cargando" class="k-icon k-i-loading" style="font-size: 32px;"></span>
		<span v-if="error" class="k-icon k-i-warning" :style="{ fontSize: '32px', color: 'red' }"></span>
		<span v-if="ok" class="k-icon k-i-check" :style="{ fontSize: '32px', color: 'darkblue' }"></span>
		<span v-if="ok">Guardado</span>

		<splitter class="splitter" :orientation="'horizontal'">
			<arbol
				:actualizar="actualizar"
				:ok="setOk"
				:error="setError"
				:cargando="setCargando"
				:customData="presupuesto"/>

			<IFCViewer/>
		</splitter>
	</window>
</template>

<script>
import { Window } from "@progress/kendo-vue-dialogs";
import { Splitter } from "@progress/kendo-layout-vue-wrapper";
import Presupuesto from "./Presupuesto.vue";
import IFCViewer from "./IFCViewer.vue";

export default {
	components: {
		window: Window,
		arbol: Presupuesto,
		IFCViewer: IFCViewer,
		splitter: Splitter,
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
			windowStage: "FULLSCREEN"
		};
	},

	methods: {
		stagechange(ev) {
			this.windowStage = ev.state;
		},

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

<style>
.splitter {
	height: 95%;
	width: 98%;
}
</style>
