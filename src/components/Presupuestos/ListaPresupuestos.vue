<template>
	<div>
		<h1>Presupuestos de {{$store.state.user.nombre}}</h1>

		<presupuesto-dialogo
				v-if="presupuestoDialogo"
				:aceptar="crearPresupuesto"
				:toggle="togglePresupuestoDialogo"
			/>

		<EditorPresupuesto
				:presupuesto="presupuestoSeleccionado"
				v-if="editando"
				:cerrar="cerrarEditor"
				:key="presupuestoSeleccionado"/>

		<buttongroup :style="{marginBottom: '10px'}">
			<!-- Botón de eliminar -->
			<k-button :icon="'trash'" :primary="true" :disabled="seleccionVacia" @click="borrarConceptosSeleccionados">
			</k-button>

			<!-- Botón de crear conceptos -->
			<k-button :icon="'plus'" :primary="true" @click="togglePresupuestoDialogo">
			</k-button>
		</buttongroup>

		<grid
				ref="lista"
				:data-items="gridData"
				:columns="columns"
				:selected-field="campoSeleccion"
				@rowdblclick="onRowClick"
				@selectionchange="onSelectionChange"
				@headerselectionchange="onHeaderSelectionChange">
		</grid>
	</div>
</template>

<script>
import { Grid } from "@progress/kendo-vue-grid";
import { Button, ButtonGroup } from "@progress/kendo-vue-buttons";
import http from "../../http-common.js";
import EditorPresupuesto from "./EditorPresupuesto.vue";
import NuevoPresupuestoDialogo from "./Dialogos/NuevoPresupuestoDialogo.vue";

export default {
	components: {
		grid: Grid,
		"k-button": Button,
		"buttongroup": ButtonGroup,
		EditorPresupuesto: EditorPresupuesto,
		presupuestoDialogo: NuevoPresupuestoDialogo,
	},

	created() {
		if (this.$store.state.logged) {
			http.get(`/presupuesto/${this.$store.state.user.u_id}`)
				.then(res => {
					this.gridData = res.data;
				})
				.catch(err => console.log(err));
		}
	},

	data: function () {
		return {
			columnasEstaticas: [
				{ field: "nombre", title: "Nombre" },
				{ field: "total", format: "{0:c}", title: "Precio Total" },
			],
			gridData: [],
			presupuestoDialogo: false,
			presupuestoSeleccionado: {},
			editando: false,
			campoSeleccion: "seleccionar"
		};
	},

	computed: {
		seleccionVacia() {
			return this.gridData.findIndex(item => item.seleccionar === true) === -1;
		},

		seleccionLlena() {
			return this.gridData.findIndex(item => item.seleccionar === false) === -1;
		},

		columns() {
			return [
				{field: this.campoSeleccion, width: '40px', headerSelectionValue: this.seleccionLlena},
				...this.columnasEstaticas];
		},
	},

	methods: {
		togglePresupuestoDialogo: function () {
			this.presupuestoDialogo = !this.presupuestoDialogo;
		},

		crearPresupuesto: function (nombre) {
			if (nombre === "") {
				return;
			}

			http.post("/presupuesto", {nombre: nombre, user_id: this.$store.state.user.u_id})
				.then(res => {
					this.gridData.push({total: 0, tabla: "[]", static_data: "{}", p_id: res.data.insertId, nombre: nombre});
					this.togglePresupuestoDialogo();
				})
				.catch(err => console.error(err));
		},

		// Cuando se cambia la selección de un presupuesto, lo cambia en la data local
		onSelectionChange: function(ev) {
			ev.dataItem[this.campoSeleccion] = !ev.dataItem[this.campoSeleccion];
		},

		onHeaderSelectionChange: function(ev) {
			let checked   = ev.event.target.checked;
			this.gridData = this.gridData.map(item => {return {...item, seleccionar: checked}});
		},

		onRowClick: function(ev) {
			if (!this.editando) {
				this.presupuestoSeleccionado = ev.dataItem;
				this.toggleEditando();
			}
		},

		borrarConceptosSeleccionados: function() {
			this.gridData.forEach(item => {
				if (item.seleccionar) {
					// Esta es una forma muy lenta de eliminar todos los presupuestos de la base de datos
					// En escalas muy grandes puede generar problemas
					// TODO agregar la capacidad de eliminar múltiples presupuestos al mismo tiempo en la API sin tener que llamarla más de una vez
					http.delete(`/presupuesto/${item.p_id}`)
						.then(() => {
							// Lo elimina localmente después de eliminarlo de la base de datos
							this.gridData = this.gridData.filter(presupuesto => presupuesto.p_id != item.p_id);
						})
						.catch(err => console.error(err));
				}
			});

		},

		toggleEditando: function() {
			this.editando = !this.editando;
		},
		cerrarEditor: function(total, tabla, p_id) {
			this.gridData.forEach((data) => {
				if (data.p_id === p_id) {
					data.tabla = tabla;
					data.total = total;
					return;
				}
			});
			this.editando = false;
		},
	},
}
</script>
