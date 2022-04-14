const PresupuestoLog = require("./PresupuestoLog");

const moverConcepto = {
	do: (source, info) => {
		let newData = [...source.localData];
		let log = new PresupuestoLog(moverConcepto);

		const {id, destino} = info;
		log.info = {id, destino}

		newData.forEach(concepto => {
			if (concepto.id === id) {
				log.info.parentViejo = concepto.parentId;

				concepto.parentId = destino;
			}
		});

		log.aCalcular = [destino];
		if (log.info.parentViejo != null)
			log.aCalcular.unshift(log.info.parentViejo);

		return {newData, log};
	},

	undo: (source, log) => {
		let newData = [...source.localData];

		newData.forEach(concepto => {
			if (log.info.id === concepto.id) {
				concepto.parentId = log.info.parentViejo;
			}
		});

		return newData;
	}
};

module.exports = moverConcepto;
