<template>
	<k-dialog>
		<form @submit="submit" class="k-form">
			<fieldset>
				<label class="k-form-field">
					<span>Nombre</span>
					<input class="k-textbox" placeholder="Nuevo Presupuesto" v-model="nuevoNombre"/>
				</label>
			</fieldset>
		</form>

		<k-dialog-actions-bar>
			<k-button @click="toggle">Cancelar</k-button>
			<k-button @click="aceptar(nuevoNombre)" :primary="true">Aceptar</k-button>
		</k-dialog-actions-bar>
	</k-dialog>
</template>

<script>
import {Dialog, DialogActionsBar} from "@progress/kendo-vue-dialogs";
import {Button}                   from "@progress/kendo-vue-buttons";

export default {
	components: {
		"k-dialog": Dialog,
		"k-dialog-actions-bar": DialogActionsBar,
		"k-button": Button,
	},

	props: {
		aceptar: Function,
		toggle: Function,
	},

	data: function() {
		return {
			nuevoNombre: "",
		};
	},

	methods: {
		submit: function (ev) {
			ev.preventDefault();

			this.aceptar(this.nuevoNombre);
		},
	},
}
</script>

<style>
fieldset {
	border: none;
	margin: 0;
	padding: 0;
}
</style>
