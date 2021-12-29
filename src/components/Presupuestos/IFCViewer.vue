<template>

	<!--upload v-if="!archivo"
					id="upload"
					:files="[]"
					:batch="false"
					:multiple="false"
					:restrictions="{allowedExtensions: ['.ifc']}"
					@add="agregarArchivo"
					/-->

	<input type="file" id="file-input" />
	<canvas id="model"/>

</template>

<script>
//import { Upload } from "@progress/kendo-vue-upload";

import IfcManager from '../../IFC/IfcManager'
import { Raycaster, Vector2 } from 'three'

export default {
	components: {
//		upload: Upload,
	},

	created() {
		this.reader = new FileReader();
	},

	data: function () {
		return {
			archivo: "",
			entityData: "",
		};
	},

	methods: {
		archivoCargado () {
			if (this.reader.result) {
				this.IFCManager.scene.ifcModel = this.IFCManager.ifcLoader.loadAsync(this.reader.result.toString());
				this.IFCManager.scene.add(this.IFCManager.scene.ifcModel.mesh);

				this.onLoaded();
			}
		},

		agregarArchivo (ev) {
			if (!ev.newState[0] || !ev.newState[0].getRawFile) {
				return;
			}

			const archivo = ev.newState[0].getRawFile();

			if (archivo) {
				this.reader.onloadend = this.archivoCargado;
				this.reader.readAsDataURL(archivo);

				return;
			}
		},

		// Métodos del viewer
		onLoaded: function() {
			this.addPicking();
			this.setupPick(this);
		},
		addPicking: function() {
			this.raycaster = new Raycaster();
			this.raycaster.firstHitOnly = true;
			this.mouse = new Vector2();
		},
		cast: function(event) {
			this.bounds = this.threeCanvas.getBoundingClientRect();
			this.x1 = event.clientX - this.bounds.left;
			this.x2 = this.bounds.right - this.bounds.left;
			this.mouse.x = (this.x1 / this.x2) * 2 - 1;
			this.y1 = event.clientY - this.bounds.top;
			this.y2 = this.bounds.bottom - this.bounds.top;
			this.mouse.y = -(this.y1 / this.y2) * 2 + 1;
			this.raycaster.setFromCamera(
				this.mouse,
				this.IFCManager.scene.camera
			);
			return this.raycaster.intersectObjects(this.IFCManager.scene.ifcModels);
		},
		pick: function(event) {
			this.found = this.cast(event)[0];
			if (this.found) {
				this.index = this.found.faceIndex;
				this.geometry = this.found.object.geometry;
				this.id = this.IFCManager.scene.ifcModel.getExpressId(
					this.geometry,
					this.index
				);
				this.entityData = this.id;
			}
		},
		setupPick: function(component) {
			component.threeCanvas = document.getElementById('model');
			component.threeCanvas.ondblclick = component.pick;
		},
	},

	mounted() {
		this.IFCManager = new IfcManager("model");

		const self = this;
		let input = document.getElementById("file-input");

		input.addEventListener(
				'change',
				async function(changed) {
					let file = changed.target.files[0]
					console.log(file);
					let ifcURL = URL.createObjectURL(file)
					self.IFCManager.scene.ifcModel = await self.IFCManager.ifcLoader.loadAsync(ifcURL);
					self.IFCManager.scene.add(self.IFCManager.scene.ifcModel.mesh)

					self.onLoaded()
				},
				false
			);
	}
}
</script>

<style>
#upload {
	z-index: 100;
}
</style>
