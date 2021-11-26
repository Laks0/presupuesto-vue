<template>
	<div>
		<h1>Presupuestos de {{$store.state.user.nombre}}</h1>

		<window v-if="presupuestoDialogo"
						:title="'Nuevo presupuesto'"
						@close="togglePresupuestoDialogo"
						:initial-width="400">

		<form class="k-form">
			<fieldset :style="{ borderStyle:'none' }">
				<label class="k-form-field">
					<span>Nombre</span>
					<input class="k-textbox" placeholder="Nuevo Presupuesto" v-model="nuevoNombre"/>
				</label>
			</fieldset>

			<div class="text-right">
				<button
					type="button"
					class="k-button"
					@click="togglePresupuestoDialogo"
					:style="{ marginRight:'10px' }">
					Cancelar
				</button>
				<button
					type="button"
					class="k-button"
					@click="crearPresupuesto">
					Aceptar
				</button>
			</div>
		</form>

		</window>

		<k-button :style="{ marginBottom: '10px' }" :primary="true" @click="togglePresupuestoDialogo">Nuevo presupuesto</k-button>
		<grid :data-items="gridData" :columns="columns">
		</grid>
	</div>
</template>

<script>
import { Window } from "@progress/kendo-vue-dialogs"
import { Grid } from "@progress/kendo-vue-grid";
import { Button } from "@progress/kendo-vue-buttons";
import http from "../../http-common.js";

export default {
	components: {
		grid: Grid,
		"k-button": Button,
		window: Window
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
			columns: [
				{ field: "nombre", title: "Nombre" },
				{ field: "total", format: "{0:c}", title: "Precio Total" },
			],
			gridData: [],
			presupuestoDialogo: false,
			nuevoNombre: ""
		};
	},

	methods: {
		togglePresupuestoDialogo: function () {
			this.presupuestoDialogo = !this.presupuestoDialogo;
			this.nuevoNombre = "";
		},

		crearPresupuesto: function () {
			if (this.nuevoNombre === "") {
				return;
			}

			http.post("/presupuesto", {nombre: this.nuevoNombre, user_id: this.$store.state.user.u_id})
				.then(res => {
					console.log(res);
					this.gridData.push({total: 0, tabla: [], p_id: res.data.insertID, nombre: this.nuevoNombre});
					this.togglePresupuestoDialogo();
				})
				.catch(err => console.error(err));
		},
	},
}
</script>
