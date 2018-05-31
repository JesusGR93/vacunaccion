const log4js = require('log4js');
log4js.configure({
  appenders: { cheese: { type: 'file', filename: './config/log/logvacunaccion.log' } },
  categories: { default: { appenders: ['cheese'], level:'all' } }
});

const logger = log4js.getLogger('vacunaccion');

exports.logTrace = function (mensaje) {
logger.trace(mensaje);
}
exports.logDebug = function (mensaje) {
logger.debug(mensaje);
}
exports.logInfo = function (mensaje) {
logger.info(mensaje);
}
exports.logWarn = function (mensaje) {
logger.warn(mensaje);
}
exports.logError = function (mensaje) {
logger.error(mensaje);
}
exports.logFatal = function (mensaje) {
logger.fatal(mensaje);
}