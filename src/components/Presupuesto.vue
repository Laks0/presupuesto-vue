<template>
	<div>
		<treelist :data-source="data"
		:editable="{mode: 'incell', move: true}"
			>
			<treelist-column :field="'Nombre'"></treelist-column>
			<treelist-column :field="'Cantidad'"></treelist-column>
			<treelist-column :editable="noEditable" :width="90" :field="'id'"></treelist-column>
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
	data() {
		return {
            data: [
                {id: 1, parentId: null, Nombre: "Elemento 1", Cantidad: null},
                {id: 2, parentId: 1, Nombre: "Elemento 2", Cantidad: null},
                {id: 3, parentId: 1, Nombre: "Elemento 3", Cantidad: 2},
                {id: 4, parentId: 2, Nombre: "Elemento 4", Cantidad: 5},
            ]
        };
	},
	methods: {
		noEditable: function () {
			return false;
		},
	}
}
</script>
