class PresupuestoLog {
	accion;
	aCalcular = [];
	estaticoACambiar;
	agregarEstatico;
	info = {};

	constructor(accion) {
		this.accion = accion;
	}
}

module.exports = PresupuestoLog;
