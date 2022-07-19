<template>
	<div :style="{height: '100%'}">
		<kbuttonGroup>
			<kbutton :disabled="!undo_enable" @click="undo">
				<span class="k-icon k-i-undo"/>
			</kbutton>

			<kbutton :disabled="!redo_enable" @click="redo">
				<span class="k-icon k-i-redo"/>
			</kbutton>
		</kbuttonGroup>

		<TreeListDataSource
				ref="dataSource"
				:data="localData"
				:schema-model="model"
				></TreeListDataSource>

		<TreeList
			data-source-ref="dataSource"
			:editable="{mode: 'incell', move: true}"
			:navigatable="true"
			:drop="checkDrop"
			@save="onSave"
			height="95%"
			:style="{lineHeight: '.5'}"
			id="tree"
			ref="tree"
		>

			<TreeListColumn :field="'nombre'" :title="'Nombre'"></TreeListColumn>

			<TreeListColumn
				:editable="independientes"
				:title="'Valor Unitario'"
				:field="'vu'"
				:format="'{0:c}'"
			></TreeListColumn>

			<TreeListColumn
				:field="'cantidad'"
				:title="'Cantidad'"
			></TreeListColumn>

			<TreeListColumn
				:editable="noEditable"
				:field="'precio'"
				:title="'Precio'"
				:format="'{0:c}'"
			></TreeListColumn>
		</TreeList>

		<ContextMenu class="menu" :target="'#tree'" :filter="'tbody > tr'" @open="contextMenuOpen" :key="seleccionado">
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
		</ContextMenu>

		<ContextMenu :target="'#tree'">
			<li @click="nuevoConcepto('Rubro', null)">Nuevo Rubro</li>
		</ContextMenu>

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

<script setup>
import { onMounted, computed, ref, reactive, defineProps} from "vue";

import http from "../../http-common.js";
import { TreeList, TreeListColumn } from "@progress/kendo-treelist-vue-wrapper";
import { TreeListDataSource } from "@progress/kendo-datasource-vue-wrapper";
import { ContextMenu } from "@progress/kendo-layout-vue-wrapper"
import RepetirDialogo from "./Dialogos/RepetirConceptoDialogo.vue";
import { Button as kbutton, ButtonGroup as kbuttonGroup } from "@progress/kendo-vue-buttons";
import { useStore } from "vuex";

let acciones = {};

acciones.borrarConcepto = require("./AccionesPresupuesto/BorrarConcepto");
acciones.editarConcepto = require("./AccionesPresupuesto/EditarConcepto");
acciones.moverConcepto  = require("./AccionesPresupuesto/MoverConcepto");
acciones.nuevoConcepto  = require("./AccionesPresupuesto/NuevoConcepto");

const localData  = ref([]);
let staticData = reactive({});

const props = defineProps({
	customData: Object,
	cargando: Function,
	error: Function,
	ok: Function
});

onMounted(() => {
	if ("customData", props.customData) {
		localData.value  = JSON.parse(props.customData.tabla);
		staticData = JSON.parse(props.customData.static_data);
		if (staticData === null) {
			staticData = {};
		}
	}
});

const model = reactive({
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
});

const repetirDialogoAbierto = ref(false);

let historial = [];
let indexHistorial = 0;

const store = useStore();

function guardar() {
	// Autoguardado en la base de datos
	const tabla = JSON.stringify(localData.value);
	const static_data = JSON.stringify(staticData);
	const p_id = props.customData.p_id;

	props.cargando();

	let total = 0
	localData.value.forEach(concepto => {
		if (concepto.parentId === null) {
			total += concepto.precio;
		}
	});

	const pres = {tabla, static_data, p_id, total};

	http.put("/presupuesto", pres)
		.then(() => {
			props.ok();
			store.commit("guardarPresupuesto", pres);
		})
		.catch(() => {
			props.error();
		});
}

const undo_enable = computed(() => {
	return historial.length - indexHistorial > 0;
});

const redo_enable = computed(() => {
	return indexHistorial > 0;
});

/// Context Menu ///
const seleccionado = ref(null);

const seleccionadoIndependiente = computed(() => {
	if (seleccionado.value === null)
		return false;

	const tipo = seleccionado.value.tipo;
	return (tipo === "Mano" || tipo === "Material");
});

const seleccionadoRubro = computed(() => {
	if (seleccionado.value === null)
		return false;

	return seleccionado.value.tipo === "Rubro";
});

//// <FUNCIONES DE HISTORIAL> ////
// estaría bueno reemplazarlas por algún log manager
function loguear(log) {
	if (indexHistorial > 0) {
		historial = historial.splice(indexHistorial);
		indexHistorial = 0;
	}

	historial.unshift(log);
}

function undo() {
	const ultima = historial[indexHistorial];

	localData.value = ultima.accion.undo(ultima);
	indexHistorial += 1;

	ultima.aCalcular.forEach(id => calcularPrecio(id));
	if (ultima.estaticoACambiar)
		actualizarConceptoEstatico(ultima.estaticoACambiar, ultima.info.keyCambiada, ultima.info.valorViejo);
	//if (ultima.agregarEstatico) {
	//	delete staticData[ultima.agregarEstatico.id];
	//}

	guardar();
}

function redo() {
	const siguiente = historial[indexHistorial - 1];

	const response = siguiente.accion.do( siguiente.info);

	localData.value = response.newData;
	siguiente.aCalcular.forEach(id => calcularPrecio(id));
	if (siguiente.estaticoACambiar)
		actualizarConceptoEstatico(siguiente.estaticoACambiar, siguiente.info.keyCambiada, siguiente.info.value);
	if (siguiente.agregarEstatico) {
		staticData[siguiente.agregarEstatico.id] = siguiente.agregarEstatico;
	}

	indexHistorial -= 1;
}

function ejecutar(accion, info) {
	const response = accion.do({localData: localData.value, staticData: staticData.value}, info);
	const log = response.log;

	localData.value = response.newData;
	log.aCalcular.forEach(id => calcularPrecio(id));

	if (log.estaticoACambiar) {
		actualizarConceptoEstatico(log.estaticoACambiar, log.info.keyCambiada, log.info.value);
	}

	if (log.agregarEstatico) {
		staticData[log.agregarEstatico.id] = log.agregarEstatico;
	}

	if (!response.log.logueado) {
		loguear(response.log);
		response.log.logueado = true;
	}

	guardar();
}
//// </FUNCIONES DE HISTORIAL> ////


function toggleRepetirDialogo() {
	repetirDialogoAbierto.value = !repetirDialogoAbierto.value;
}

const tree = ref(null);

function contextMenuOpen(ev) {
	const tl = tree.value.kendoWidget();
	let dataItem = tl.dataItem(ev.target);

	seleccionado.value = dataItem;
}

function borrarConcepto() {
	ejecutar(borrarConcepto, {concepto: seleccionado});
}

function crearHijo(tipo) {
	const id = seleccionado.value.id;

	nuevoConcepto(tipo, id);
}

function nuevoConcepto(tipo, parentId) {
	ejecutar(nuevoConcepto, {
		tipo,
		parentId,
		repetido: false
	});
}

function repetirConcepto(staticId, parentId) {
	ejecutar(nuevoConcepto, {
		staticId,
		parentId,
		repetido: true,
	});
}

function actualizarConceptoEstatico(id, key, valor) {
	staticData[id][key] = valor;
	let actualizar = [];

	let data = [...localData.value];
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

	localData.value = data;

	for (let i = 0; i < actualizar.length; i++) {
		calcularPrecio(actualizar[i]);
	}

	console.log(staticData);
}

// Funcion que se ejecuta en cada drop
function checkDrop(ev) {
	// Si el concepto que se está moviendo es un rubro
	// o el destino es independiente, es inválido
	if (ev.source.tipo === "Rubro" || independientes(ev.destination) || ev.source.tipo === ev.destination.tipo) {
		ev.setValid(false);
		return;
	}

	ejecutar(acciones.moverConcepto, {
		id: ev.source.id,
		destino: ev.destination.id,
	});
}

// FUNCIONES BOOLEANAS DE EDITABLES //
function noEditable() {
	return false;
}
// Devuelve falso cuando es un concepto dependiente (rubro o tarea)
function independientes(concepto) {
	return concepto.tipo != "Rubro" && concepto.tipo != "Tarea";
}

// Función recursiva que calcula el acumulado de los precios de los hijos
function calcularPrecio(id) {
	const data = [...localData.value];
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
	localData.value = data;

	if (aCalcular.parentId != null) {
		calcularPrecio(aCalcular.parentId);
	}
}

//   EVENTOS   //

// editar
function onSave(ev) {
	ev.preventDefault();

	const key = Object.keys(ev.values)[0];

	ejecutar(acciones.editarConcepto, {
		keyCambiada: key,
		value: ev.values[key],
		id: ev.model.id,
	});
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
