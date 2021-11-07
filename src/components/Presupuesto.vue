<template>
	<div>
		<treelist :data-source="dataSource"
			:editable="{mode: 'incell', move: true}"
			:navigatable="true"
			:drop="checkDrop"
			:toolbar="['create']"
			@save="onEdit"
		>

			<treelist-column :field="'nombre'"></treelist-column>

			<treelist-column
				:editable="independientes"
				:field="'vu'"
			></treelist-column>

			<treelist-column
				:editable="independientes"
				:field="'cantidad'"
			></treelist-column>

			<treelist-column
				:editable="noEditable"
				:lockable="false"
				:field="'precio'"
				:format="'{0:c}'"
			></treelist-column>
		</treelist>
	</div>
</template>

<script>
import { TreeList, TreeListColumn } from "@progress/kendo-treelist-vue-wrapper";

export default {
	name: "Presupuesto",
	components: {
		"treelist": TreeList,
		"treelist-column": TreeListColumn
	},
	data: function() {
		return {
			dataSource: {
				aggregate: [
					{ field: "precio", aggregate: "sum" }
				],
				data: [
					{id: 1, parentId: null, tipo: "Rubro", nombre: "Rubro"},
					{id: 2, parentId: 1, tipo: "Tarea", nombre: "Tarea"},
					{id: 3, parentId: 1, tipo: "Material", nombre: "Material", vu: 2},
					{id: 4, parentId: 2, tipo: "Mano", nombre: "Mano de obra", cantidad: 5},
				],
			}
		};
	},

	methods: {
		// Encuentra un concepto por id
		encontrarPorId: function(id) {
			console.log(this);
			return this.dataSource.data.find(concepto => concepto.id === id);
		},

		// Verifica si el drop es válido
		checkDrop(evento) {
			// Si el concepto que se está moviendo es dependiente
			// o el destino es independiente, es inválido
			if (!this.independientes(evento.source) || this.independientes(evento.destination)) {
				evento.setValid(false);
			}
		},

		// FUNCIONES BOOLEANAS DE EDITABLES //
		noEditable: function () {
			return false;
		},
		// Devuelve falso cuando es un concepto dependiente (rubro o tarea)
		independientes: function (concepto) {
			return concepto.tipo != "Rubro" && concepto.tipo != "Tarea";
		},

		calcularPrecio: function (concepto) {
			if ( concepto.vu === null || concepto.cantidad === null ) {
				return null;
			}
			return concepto.vu * concepto.cantidad;
		},

		//   EVENTOS   //

		// editar
		onEdit: function (ev) {
			let concepto = ev.model;

			if (this.independientes(concepto)) {
				// Si se cambió el VU o la cantidad
				if ("vu" in ev.values || "cantidad" in ev.values) {
					// Se mezclan los valores cambiados con los viejos
					concepto.precio = this.calcularPrecio(Object.assign(concepto, ev.values));
					this.actualizarPrecio(this.encontrarPorId(concepto.parentId));
				}
			}
		},
		// función recursiva que actualiza los precios
		actualizarPrecio: function(concepto) {
			console.log(concepto, "#= sum #");
		},
	},
}
</script>
