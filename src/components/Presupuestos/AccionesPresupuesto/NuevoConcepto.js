const PresupuestoLog = require("./PresupuestoLog");

const nuevoConcepto = {
	do: (source, info) => {
		let newData = source.localData;
		let log = new PresupuestoLog(nuevoConcepto);

		const {repetido, tipo, parentId, staticId} = info;
		log.info = info;

		const date          = Date.now();
		const independiente = tipo === "Mano" || tipo === "Material";

		let conceptoAgregado = {};
		if (repetido) { // Si se está repitiendo un concepto estático

			conceptoAgregado = Object.assign({}, source.staticData[staticId]);

		} else { // Si se está creando un concepto nuevo
			conceptoAgregado = {
				staticId: independiente ? date : null, // ID del concepto estático (igual a la local)
				tipo: tipo,
				precio: 0,
				vu: independiente ? 0 : null,
				cantidad: 1,
				nombre: tipo,
			};
		}
		conceptoAgregado.id = date;
		log.info.id = date;
		conceptoAgregado.parentId = parentId;

		if (independiente && !repetido)
			log.agregarEstatico = {...conceptoAgregado};

		newData.unshift(conceptoAgregado);

		log.aCalcular.unshift(parentId);

		return {newData, log};
	},

	undo: (source, log) => {
		let newData = [...source.localData];

		newData = newData.filter(concepto => concepto.id != log.info.id);

		return newData;
	},
};

module.exports = nuevoConcepto;
