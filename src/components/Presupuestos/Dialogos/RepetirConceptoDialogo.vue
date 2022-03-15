<template>
	<k-dialog v-if="abierto" @close="toggle" class="dialogo">
		<k-grid
				ref="lista"
				:columns="columnas"
				:data-items="arrayConceptos"
				@rowdblclick="onRowClick"
				>
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

export default {
	components: {
		"k-dialog": Dialog,
		"k-dialog-actions-bar": DialogActionsBar,
		"k-grid": Grid,
		"k-button": Button
	},

	computed: {
		arrayConceptos: function () {
			let arr = [];
			const keys = Object.keys(this.conceptos);

			keys.forEach(key => {
				let concepto = this.conceptos[key];

				arr.push(concepto);
			});

			return arr;
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
				{ field: "vu", title: "Valor Unitario", width: "150px", format: '{0:c}' },
			],
		}
	},

	methods: {
		onRowClick: function (ev) {
			this.elegirConcepto(ev.dataItem.id, this.parent.id);
			this.toggle();
		},
	},
}
</script>

<style>
.dialogo {
	width: 50%;
	margin-left: 25%;
	margin-right: 25%;
}
</style>
