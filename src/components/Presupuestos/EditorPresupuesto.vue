<template>
	<div class="main-div">
		<k-button class="back" @click="goHome"><span class="k-icon k-i-arrow-left"></span></k-button>

		<loader v-if="cargando"/>
		<span v-if="error" class="k-icon k-i-warning" :style="{ fontSize: '32px', color: 'red' }"></span>
		<span v-if="ok" class="k-icon k-i-check" :style="{ fontSize: '32px', color: 'darkblue' }"></span>
		<span v-if="ok">Guardado</span>

		<splitter
				@change="onHorizontalChange"
				:style="{height: '95vh'}"
				:panes="paneles"
				:orientation="'horizontal'">

			<template v-slot:arbol>
				<arbol
					:key="presupuesto"
					:ok="setOk"
					:error="setError"
					:cargando="setCargando"
					:customData="presupuesto"/>
			</template>

			<template v-slot:ifc>
				<IFCViewer :key="paneles"/>
			</template>

		</splitter>
	</div>
</template>

<script>
import { Splitter } from "@progress/kendo-vue-layout";
import { Loader } from "@progress/kendo-vue-indicators";
import { Button } from "@progress/kendo-vue-buttons";
import Presupuesto from "./Presupuesto.vue";
import IFCViewer from "./IFCViewer.vue";

export default {
	components: {
		arbol: Presupuesto,
		IFCViewer: IFCViewer,
		splitter: Splitter,
		loader: Loader,
		"k-button": Button,
	},

	data: function() {
		return {
			cargando: false,
			error: false,
			ok: false,
			presupuesto: null,

			paneles: [
				{ content: "arbol", size: "50%" },
				{ content: "ifc" }
			],
		};
	},

	created: function() {
		this.$store.dispatch("checkPresupuesto", this.$route.params.pid)
			.then(() => {
				this.presupuesto = this.$store.getters.presupuesto;
			})
			.catch(err => console.error(err));
	},

	methods: {
		stagechange(ev) {
			this.windowStage = ev.state;
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
		goHome() {
			this.$router.push("/");
		},

		onHorizontalChange(event) {
			event.newState !== undefined? this.paneles = event.newState:"";
		},
	},
}
</script>

<style>
.back {
	margin-right: 5px;
}
</style>
