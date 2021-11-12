<template>
	<div>
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
import { TreeListDataSource } from "@progress/kendo-datasource-vue-wrapper";

export default {
	name: "Presupuesto",
	components: {
		"treelist": TreeList,
		"treelist-column": TreeListColumn,
		"treelistdatasource": TreeListDataSource,
	},
	data: function() {
		return {
			model: {
				id: "id",
				parentId: "parentId",
				fields: {
					tipo: {field: "tipo", type: "string"},
					nombre: {field: "nombre", type: "string"},
					vu: {field: "vu", type: "number"},
					cantidad: {field: "cantidad", type: "number"},
					precio: {field: "precio", type: "number"},
				},
				expanded: true,
			},

			localData: [
				{id: 1, parentId: null, tipo: "Rubro", nombre: "Rubro"},
				{id: 2, parentId: 1, tipo: "Tarea", nombre: "Tarea"},
				{id: 3, parentId: 1, tipo: "Material", nombre: "Material", vu: 2},
				{id: 4, parentId: 2, tipo: "Mano", nombre: "Mano de obra", cantidad: 5},
			],
		};
	},

	methods: {
		// Encuentra un concepto por id
		encontrarPorId: function(id) {
			return this.localData.find(concepto => concepto.id === id);
		},

		// Verifica si el drop es válido
		checkDrop(ev) {
			// Si el concepto que se está moviendo es dependiente
			// o el destino es independiente, es inválido
			if (!this.independientes(ev.source) || this.independientes(ev.destination)) {
				ev.setValid(false);
				return;
			}

			//const data = [...this.localData];
			//let cambiado = data.find(concepto => concepto.id === ev.source.id);
			//cambiado.parentId = ev.destination.id;
			//this.localData = data;
			console.log(this.localData);
		},

		// FUNCIONES BOOLEANAS DE EDITABLES //
		noEditable: function () {
			return false;
		},
		// Devuelve falso cuando es un concepto dependiente (rubro o tarea)
		independientes: function (concepto) {
			return concepto.tipo != "Rubro" && concepto.tipo != "Tarea";
		},

		//   EVENTOS   //

		// editar
		onSave: function (ev) {
			const data = [...this.localData];
			data.forEach((concepto) => {
				if (concepto.id === ev.model.id) {
					const keyCambiada = Object.keys(ev.values)[0];
					concepto[keyCambiada] = ev.values[keyCambiada];

					if (keyCambiada === "vu" || keyCambiada === "cantidad") {
						concepto.precio = concepto.vu * concepto.cantidad;
					}

					return concepto;
				}
			});

			this.localData = data;
		},
	},
}
</script>
