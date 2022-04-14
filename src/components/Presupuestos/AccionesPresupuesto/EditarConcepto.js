const PresupuestoLog = require("./PresupuestoLog");

const editarConcepto = {
	do: (source, info) => {
		let newData = [...source.localData];
		const log = new PresupuestoLog(editarConcepto);

		const {keyCambiada, id, value} = info;
		log.info = {keyCambiada, id, value};

		newData.forEach(concepto => {
			if (concepto.id === id) {
				log.info.valorViejo = concepto[keyCambiada];
				concepto[keyCambiada] = value;

				if (keyCambiada === "vu" || keyCambiada === "cantidad") {
					concepto.precio = (concepto.vu * concepto.cantidad) || 0;
					if (concepto.parentId != null)
						log.aCalcular.unshift(concepto.parentId);
				}

				if (concepto.staticId != null && (keyCambiada === "nombre" || keyCambiada === "vu")) {
					log.estaticoACambiar = concepto.staticId;
				}

				return concepto;
			}
		});

		return {newData, log};
	},

	undo: (source, log) => {
		let newData = [...source.localData];

		newData.forEach(concepto => {
			if (concepto.id === log.info.id) {
				concepto[log.info.keyCambiada] = log.info.valorViejo;

				const key = log.info.keyCambiada;
				if (key === "vu" || key === "cantidad") {
					concepto.precio = (concepto.cantidad * concepto.vu) || 0;
				}
				return
			}
		});

		return newData;
	}
}

module.exports = editarConcepto;
