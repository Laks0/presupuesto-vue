<template>
	<div :style="{height: '100%'}">
		<k-button-group>
			<k-button :disabled="!undo_enable" @click="undo">
				<span class="k-icon k-i-undo"/>
			</k-button>

			<k-button :disabled="!redo_enable" @click="redo">
				<span class="k-icon k-i-redo"/>
			</k-button>
		</k-button-group>

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

		<k-contextmenu class="menu" :target="'#tree'" :filter="'tbody > tr'" @open="contextMenuOpen" :key="seleccionado">
			<li v-if="!seleccionadoIndependiente" @click="toggleRepetirDialogo"> Repetir Concepto	</li>
			<li v-if="!seleccionadoIndependiente">
				Nuevo
				<ul>
					<li v-if="seleccionadoRubro" @click="crearHijo('Tarea')">Tarea</li>
					<li @click="crearHijo('Mano')"		>Mano de Obra</li>
					<li @click="crearHijo('Material')">Material		 </li>
				</ul>
			</li>
			<li @click="borrarConcepto">Borrar</li>
		</k-contextmenu>

		<k-contextmenu :target="'#tree'">
			<li @click="nuevoConcepto('Rubro', null)">Nuevo Rubro</li>
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
import { ContextMenu } from "@progress/kendo-layout-vue-wrapper"
import RepetirDialogo from "./Dialogos/RepetirConceptoDialogo.vue";
import { Button, ButtonGroup } from "@progress/kendo-vue-buttons";

const borrarConcepto = require("./AccionesPresupuesto/BorrarConcepto");
const editarConcepto = require("./AccionesPresupuesto/EditarConcepto");
const moverConcepto  = require("./AccionesPresupuesto/MoverConcepto");

export default {
	name: "Presupuesto",
	components: {
		"treelist": TreeList,
		"treelist-column": TreeListColumn,
		"treelistdatasource": TreeListDataSource,
		"k-contextmenu": ContextMenu,
		"repetir-dialogo": RepetirDialogo,
		"k-button": Button,
		"k-button-group": ButtonGroup,
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
			this.localData  = JSON.parse(this.customData.tabla);
			this.staticData = JSON.parse(this.customData.static_data);
			if (this.staticData === null) {
				this.staticData = {};
			}
		}
	},

	computed: {
		seleccionadoIndependiente: function() {
			if (this.seleccionado === null)
				return false;

			const tipo = this.seleccionado.tipo;
			return (tipo === "Mano" || tipo === "Material");
		},

		seleccionadoRubro: function() {
			if (this.seleccionado === null)
				return false;

			return this.seleccionado.tipo === "Rubro";
		},

		undo_enable: function() {
			return this.historial.length - this.indexHistorial > 0;
		},

		redo_enable: function() {
			return this.indexHistorial > 0;
		},
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

			historial: [],
			indexHistorial: 0,
		};
	},

	methods: {
		//// <FUNCIONES DE HISTORIAL> ////
		// estaría bueno reemplazarlas por algún log manager
		loguear: function (log) {
			if (this.indexHistorial > 0) {
				this.historial = this.historial.splice(this.indexHistorial);
				this.indexHistorial = 0;
			}

			this.historial.unshift(log);
		},

		undo: function () {
			const ultima = this.historial[this.indexHistorial];

			this.localData = ultima.accion.undo(this, ultima);
			this.indexHistorial += 1;

			ultima.aCalcular.forEach(id => this.calcularPrecio(id));
			if (ultima.estaticoACambiar)
				this.actualizarConceptoEstatico(ultima.estaticoACambiar, ultima.info.keyCambiada, ultima.info.valorViejo);

			this.guardar();
		},

		redo: function () {
			const siguiente = this.historial[this.indexHistorial - 1];

			this.ejecutar(siguiente.accion, siguiente.info);

			this.indexHistorial -= 1;
		},

		ejecutar: function (accion, info) {
			const response = accion.do(this, info);
			const log = response.log;

			this.localData = response.newData;
			log.aCalcular.forEach(id => this.calcularPrecio(id));

			if (log.estaticoACambiar) {
				this.actualizarConceptoEstatico(log.estaticoACambiar, log.info.keyCambiada, log.info.value);
			}

			this.loguear(response.log);

			this.guardar();
		},
		//// </FUNCIONES DE HISTORIAL> ////

		guardar: function () {
			// Autoguardado en la base de datos
			let tabla = JSON.stringify(this.localData);
			let static_data = JSON.stringify(this.staticData);
			let p_id = this.customData.p_id;

			this.cargando();

			let total = 0
			this.localData.forEach(concepto => {
				if (concepto.parentId === null) {
					total += concepto.precio;
				}
			});

			http.put("/presupuesto", {tabla, static_data, p_id, total})
				.then(() => {
					this.ok();
					this.actualizar(total, tabla, p_id);
				})
				.catch(() => {
					this.error();
				});
		},

		toggleRepetirDialogo: function() {
			this.repetirDialogoAbierto = !this.repetirDialogoAbierto;
		},

		contextMenuOpen: function(ev) {
			const tl = this.$refs["tree"].kendoWidget();
			let dataItem = tl.dataItem(ev.target);

			this.seleccionado = dataItem;
		},

		borrarConcepto: function() {
			this.ejecutar(borrarConcepto, {concepto: this.seleccionado});
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
			let actualizar = [];

			let data = [...this.localData];
			for (let i = 0; i < data.length; i++) {
				let concepto = data[i];

				if (concepto.staticId != id)
					continue;

				concepto[key] = valor;
				const targetPrecio = concepto.vu * concepto.cantidad;

				if (concepto.precio != targetPrecio) {
					concepto.precio = targetPrecio;
					actualizar.push(concepto.parentId);
				}
			}

			this.localData = data;

			for (let i = 0; i < actualizar.length; i++) {
				this.calcularPrecio(actualizar[i]);
			}
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

			this.ejecutar(moverConcepto, {
				id: ev.source.id,
				destino: ev.destination.id,
			});
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

			if (!aCalcular) return

			aCalcular.vu = precio;
			aCalcular.precio = precio * aCalcular.cantidad;
			this.localData = data;

			if (aCalcular.parentId != null) {
				this.calcularPrecio(aCalcular.parentId);
			}
		},

		//   EVENTOS   //

		// editar
		onSave: function (ev) {
			ev.preventDefault();

			const key = Object.keys(ev.values)[0];

			this.ejecutar(editarConcepto, {
				keyCambiada: key,
				value: ev.values[key],
				id: ev.model.id,
			});
		},

		getTree: function() {
			return JSON.stringify(this.localData);
		},
	},
}
</script>

<style>
.botones > * {
	margin: 5px;
}
.k-group > li {
	line-height: .7 !important;
}
tr[aria-expanded] > td {
	background-color: lightblue !important;
	text-align: right;
}
tr[aria-expanded] > td:first-child {
	text-align: left;
}
</style>
