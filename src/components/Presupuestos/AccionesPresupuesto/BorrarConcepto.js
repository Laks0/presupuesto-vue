const PresupuestoLog = require("./PresupuestoLog");

const borrarConcepto = {
	// recibe concepto: {concepto a borrar}
	// devuelve {newData: [data nueva]}
	do: (source, info) => {
		const concepto = info.concepto;
		const originalData = [...source.localData];

		let newData = originalData.filter(c => c.id != concepto.id);

		const log = new PresupuestoLog(borrarConcepto);

		log.info.concepto = concepto;
		if (concepto.parentId != null)
			log.aCalcular.unshift(concepto.parentId);

		return {newData, log};
	},

	undo: (source, log) => {
		let newData = [...source.localData];
		newData.unshift(log.info.concepto);

		return newData;
	},
};

module.exports = borrarConcepto;
