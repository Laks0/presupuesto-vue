<template>
	<div ref="container" id="container" :style="{width: '50%', height: '97%'}">
		<upload v-if="!archivo"
		:files="archivo"
		:batch="false"
		:multiple="false"
		:restrictions="{
									allowedExtensions: ['.ifc']
									}"
		/>
	</div>

</template>

<script>
import { Upload } from "@progress/kendo-vue-upload";
import { IfcViewerAPI, IFC } from "web-ifc-viewer";
import { Color } from "three";

export default {
	components: {
		upload: Upload,
	},

	data: function () {
		return {
			archivo: null,
		};
	},

	methods: {
		agregarArchivo (ev) {
			console.log(ev.affectedFiles);
		},
	},

	mounted() {
		const container = this.$refs.container;

		// Initialize IFC.js API and add it as global variable
		const viewer = new IfcViewerAPI({
														container,
														backgroundColor: new Color(0xffffff)
																});
		viewer.IFC.applyWebIfcConfig({
														COORDINATE_TO_ORIGIN: true,
														USE_FAST_BOOLS: true
																});
		window.webIfcAPI = viewer;

		// Set up scene
		viewer.addAxes();
		viewer.addGrid(50, 50);
		viewer.IFC.setWasmPath('wasm/');
		viewer.clipper.active = true;
		let dimensionsActive = false;

		// Add basic input logic
		const handleKeyDown = (event) => {
				if (event.code === 'KeyE') {
						dimensionsActive = !dimensionsActive;
						viewer.dimensions.active = dimensionsActive;
						viewer.dimensions.previewActive = dimensionsActive;
						viewer.IFC.unPrepickIfcItems();
						window.onmousemove = dimensionsActive ? null : IFC.prePickIfcItem;
				}
				if (event.code === 'KeyD') {
						viewer.dimensions.create();
				}
				if (event.code === 'KeyG') {
						viewer.clipper.createPlane();
				}
				if (event.code === 'Delete') {
						viewer.dimensions.deleteAll();
						viewer.clipper.deletePlane();
						viewer.IFC.unpickIfcItems();
				}
		};
		window.onkeydown = handleKeyDown;

		// Highlight items when hovering over them
		window.onmousemove = viewer.IFC.prePickIfcItem;

		// Select items and log properties
		window.ondblclick = async () => {
				const item = await viewer.IFC.pickIfcItem(true);
				if(item.modelID === undefined || item.id === undefined ) return;
				console.log(
						await viewer.IFC.getProperties(item.modelID, item.id, true));
		}
	}
}
</script>
