<template>
	<k-dialog v-if="abierto" @close="toggle">
		<k-grid
				ref="lista"
				:columns="columnas"
				:data-items="arrayConceptos"
				:filterable="true"
				:filter="filtro"
				@filterchange="onFilterChange"
				:filter-cell-render="filterRender"
				@rowdblclick="onRowClick"
				>

				<!-- Filtro de tipo de concepto -->
				<template v-slot:filtroTipo="{props}">
					<div>
						<dropdown
								:fill-mode="'outline'"
								:data-items="['Mano de obra', 'Material']"
								:default-item="'Todos'"
								@change="ev => {props.onChange({ operator: 'contains', field: props.field, value: ev.target.value === 'Todos' ? '' : ev.target.value });}">
						</dropdown>
					</div>
				</template>
		</k-grid>

		<k-dialog-actions-bar>
			<k-button
					class="k-button"
					@click="toggle">
				Cancelar
			</k-button>
		</k-dialog-actions-bar>
	</k-dialog>
</template>

<script>
import { Dialog, DialogActionsBar } from "@progress/kendo-vue-dialogs";
import { Grid }                     from "@progress/kendo-vue-grid";
import { Button }                   from "@progress/kendo-vue-buttons";
import { filterBy }                 from "@progress/kendo-data-query";
import { DropDownList }             from "@progress/kendo-vue-dropdowns";

export default {
	components: {
		"k-dialog": Dialog,
		"k-dialog-actions-bar": DialogActionsBar,
		"k-grid": Grid,
		"k-button": Button,
		"dropdown": DropDownList,
	},

	computed: {
		arrayConceptos: function () {
			let arr = [];
			const keys = Object.keys(this.conceptos);

			keys.forEach(key => {
				let concepto = this.conceptos[key];
				if (concepto.tipo === "Mano")
					concepto.tipo = "Mano de obra";

				arr.push(concepto);
			});

			// Antes de devolver el array lo paso por el filtro.
			let arrayFilrado = filterBy(arr, this.filtro);

			return arrayFilrado;
		}
	},

	props: {
		conceptos: Object,
		abierto: Boolean,
		toggle: Function,
		elegirConcepto: Function,
		parent: Object,
	},

	data: function () {
		return {
			columnas: [
				{ field: "nombre", title: "Nombre" },
				{ field: "tipo", title: "Tipo", width: "200", filterCell: "filtroTipo" },
				{ field: "vu", title: "Valor Unitario", filter: "numeric", width: "200", format: '{0:c}' },
			],

			filtro: {
				logic: "and",

				filters: [
				]
			},
		}
	},

	methods: {
		onRowClick: function (ev) {
			this.elegirConcepto(ev.dataItem.id, this.parent.id);
			this.toggle();
		},
		onFilterChange: function(ev) {
			this.filtro = ev.filter;
		},
		filterRender: function(_, defaultRendering) {
			return defaultRendering;
		},
	},
}
</script>

<style>
.k-dialog {
	width: 70%;
}
.k-animation-container-relative {
	z-index: 10003 !important;
}
</style>
