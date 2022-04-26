<template>
	<div id="main-div">
		<input type="file" id="file-input" :style="{ marginBottom: '10px', marginTop: '5px' }"/>
		<div id="viewer-container"/>
	</div>
</template>

<script>
import {IfcViewerAPI} from "web-ifc-viewer";

export default {
	mounted: function() {
		const container = document.getElementById("viewer-container");
		const viewer = new IfcViewerAPI({container});
		viewer.addAxes();
		viewer.addGrid();
	}
}
</script>

<style>
#main-div {
	height: 100%;
	width: 100%;
}

#viewer-container {
	height: 100%;
	width: 100%;
}

#file-input {
	position: absolute;
}
</style>
