<template>
	<div :style="{height: '100%'}">
		<div class="botones">
			<k-button
					:primary="true"
					@click="nuevoConcepto('Rubro')">
				Nuevo Rubro
			</k-button>
			<k-button
					:primary="true"
					@click="nuevoConcepto('Tarea')">
				Nueva Tarea
			</k-button>
		</div>

		<treelistdatasource
				ref="dataSource"
				:data="localData"
				:schema-model="model"
				></treelistdatasource>

		<treelist
			data-source-ref="dataSource"
			:editable="{mode: 'incell', move: true}"
			:navigatable="true"
			:drop="checkDrop"
			@save="onSave"
			height="70vh"
			:style="{lineHeight: '.5'}"
			id="tree"
			ref="tree"
		>

			<treelist-column :field="'nombre'" :title="'Nombre'"></treelist-column>

			<treelist-column
				:editable="independientes"
				:title="'Valor Unitario'"
				:field="'vu'"
				:format="'{0:c}'"
			></treelist-column>

			<treelist-column
				:editable="independientes"
				:field="'cantidad'"
				:title="'Cantidad'"
			></treelist-column>

			<treelist-column
				:editable="noEditable"
				:field="'precio'"
				:title="'Precio'"
				:format="'{0:c}'"
			></treelist-column>
		</treelist>

		<k-contextmenu :target="'#tree'" :filter="'tbody > tr[aria-expanded]'" @open="contextMenuOpen">
			<li @click="toggleRepetirDialogo">Repetir Concepto</li>
			<li @click="crearHijo('Mano')">Nueva Mano de Obra</li>
			<li @click="crearHijo('Material')">Nuevo Material</li>
			<li @click="borrarConcepto">Borrar</li>
		</k-contextmenu>

		<k-contextmenu :target="'#tree'" :filter="'tbody > tr'" @open="contextMenuOpen">
			<li @click="borrarConcepto">Borrar</li>
		</k-contextmenu>

		<repetir-dialogo
				:abierto="repetirDialogoAbierto"
				:conceptos="staticData"
				:toggle="toggleRepetirDialogo"
				:elegirConcepto="repetirConcepto"
				:parent="seleccionado"
				>
		</repetir-dialogo>
	</div>
</template>

<script>
import http from "../../http-common.js";
import { TreeList, TreeListColumn } from "@progress/kendo-treelist-vue-wrapper";
import { TreeListDataSource } from "@progress/kendo-datasource-vue-wrapper";
import { Button } from "@progress/kendo-vue-buttons";
import { ContextMenu } from "@progress/kendo-layout-vue-wrapper"
import RepetirDialogo from "./Dialogos/RepetirConceptoDialogo.vue";

export default {
	name: "Presupuesto",
	components: {
		"treelist": TreeList,
		"treelist-column": TreeListColumn,
		"treelistdatasource": TreeListDataSource,
		"k-button": Button,
		"k-contextmenu": ContextMenu,
		"repetir-dialogo": RepetirDialogo,
	},

	props: {
		customData: Object,
		ok: Function,
		error: Function,
		cargando: Function,
		actualizar: Function,
	},

	mounted() {
		if (this.customData) {
			this.localData = JSON.parse(this.customData.tabla);
		}
	},

	updated() {
		// Autoguardado en la base de datos
		let tabla = JSON.stringify(this.localData);
		let p_id = this.customData.p_id;

		this.cargando();

		let total = 0
		this.localData.forEach(concepto => {
			if (concepto.parentId === null) {
				total += concepto.precio;
			}
		});

		http.put("/presupuesto", {tabla, p_id, total})
			.then(() => {
				this.ok();
				this.actualizar(total, tabla, p_id);
			})
			.catch(() => {
				this.error();
			});
	},

	data: function() {
		return {
			seleccionado: null, // Guarda el concepto seleccionado cuando se hace click derecho
			model: {
				id: "id",
				parentId: "parentId",
				fields: {
					tipo: {field: "tipo", type: "string"},
					// Rubro, Tarea, Mano, Material
					nombre: {field: "nombre", type: "string", validation: {required: true}},
					vu: {field: "vu", type: "number"},
					cantidad: {field: "cantidad", type: "number"},
					precio: {field: "precio", type: "number"},
				},
				expanded: true,
			},

			localData: [],
			staticData: {},

			repetirDialogoAbierto: false,
		};
	},

	methods: {
		toggleRepetirDialogo: function() {
			this.repetirDialogoAbierto = !this.repetirDialogoAbierto;
		},


		contextMenuOpen: function(ev) {
			const tl = this.$refs["tree"].kendoWidget();
			let dataItem = tl.dataItem(ev.target);

			this.seleccionado = dataItem;
		},

		borrarConcepto: function() {
			const parentId = this.seleccionado.parentId;
			// Array nuevo con el seleccionado filtrado
			let data = this.localData.filter(concepto => concepto.id != this.seleccionado.id);
			this.localData = data;

			if (parentId == null) {
				return
			}
			this.calcularPrecio(parentId);
		},

		crearHijo: function(tipo) {
			const id = this.seleccionado.id;

			this.nuevoConcepto(tipo, id);
		},

		nuevoConcepto: function(tipo, parent) {
			const date          = Date.now();
			const independiente = tipo === "Mano" || tipo === "Material";

			const conceptoAgregado = {
				id: date, // ID única del concepto local
				staticId: independiente ? date : null, // ID del concepto estático (igual a la local)
				tipo: tipo,
				precio: 0,
				vu: independiente ? 0 : null,
				cantidad: 1,
				parentId: parent || null,
				nombre: tipo,
			};

			const nuevaData = [...this.localData];
			nuevaData.unshift(conceptoAgregado);

			this.localData = nuevaData;

			if (!independiente)
				return

			// Cuando se crea un concepto independiente nuevo, automáticamente se crea también un estático
			this.staticData[date] = {...conceptoAgregado};
		},

		repetirConcepto: function(id, parent) {
			const date = Date.now();

			const conceptoAgregado = Object.assign({}, this.staticData[id]);
			conceptoAgregado.id = date;
			conceptoAgregado.parentId = parent;

			const nuevaData = [...this.localData];
			nuevaData.unshift(conceptoAgregado);
			this.localData = nuevaData;
		},

		actualizarConceptoEstatico: function(id, key, valor) {
			this.staticData[id][key] = valor;
		},

		// Encuentra un concepto por id
		encontrarPorId: function(id) {
			return this.localData.find(concepto => concepto.id === id);
		},

		// Funcion que se ejecuta en cada drop
		checkDrop(ev) {
			// Si el concepto que se está moviendo es un rubro
			// o el destino es independiente, es inválido
			if (ev.source.tipo === "Rubro" || this.independientes(ev.destination) || ev.source.tipo === ev.destination.tipo) {
				ev.setValid(false);
				return;
			}

			const data = [...this.localData];
			let cambiado = data.find(concepto => concepto.id === ev.source.id);
			let parentViejo = cambiado.parentId;
			cambiado.parentId = ev.destination.id;
			this.localData = data;

			// Por ahí no es la forma más eficiente de recalcular los precios, pero funciona
			if (parentViejo != null) {
				this.calcularPrecio(parentViejo);
			}
			this.calcularPrecio(cambiado.parentId);
		},

		// FUNCIONES BOOLEANAS DE EDITABLES //
		noEditable: function () {
			return false;
		},
		// Devuelve falso cuando es un concepto dependiente (rubro o tarea)
		independientes: function (concepto) {
			return concepto.tipo != "Rubro" && concepto.tipo != "Tarea";
		},

		// Función recursiva que calcula el acumulado de los precios de los hijos
		calcularPrecio: function (id) {
			const data = [...this.localData];
			var aCalcular;
			let precio = 0;

			data.forEach((concepto) => {
				if (concepto.parentId === id && concepto.precio != null) {
					precio += concepto.precio;
				}
				if (concepto.id === id) {
					aCalcular = concepto;
				}
			});

			aCalcular.precio = precio;
			this.localData = data;

			if (aCalcular.parentId != null) {
				this.calcularPrecio(aCalcular.parentId);
			}
		},

		//   EVENTOS   //

		// editar
		onSave: function (ev) {
			// Variable verifica si el precio se cambió para poder calcular el del padre
			let cambioPrecio = false;
			const keyCambiada = Object.keys(ev.values)[0];

			let data = [...this.localData];
			data.forEach((concepto) => {
				if (concepto.id === ev.model.id) {
					concepto[keyCambiada] = ev.values[keyCambiada];

					if (keyCambiada === "vu" || keyCambiada === "cantidad") {
						concepto.precio = (concepto.vu * concepto.cantidad) || 0;
						cambioPrecio = true;
					}

					return concepto;
				}
			});
			this.localData = data;

			if (cambioPrecio) {
				this.calcularPrecio(ev.model.parentId);
			}

			if (keyCambiada === "vu" || keyCambiada === "nombre")
				this.actualizarConceptoEstatico(ev.model.staticId, keyCambiada, ev.values[keyCambiada]);

		},

		getTree: function() {
			return JSON.stringify(this.localData);
		},

		onRepetirConceptoClick: function(ev) {
			console.log(ev);
		},
	},
}
</script>

<style>
.botones > * {
	margin: 5px;
}
tr[aria-expanded] > td {
	background-color: lightblue !important;
}
</style>
