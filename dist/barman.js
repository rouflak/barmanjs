"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bottlejs = require("bottlejs");

var _bottlejs2 = _interopRequireDefault(_bottlejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MISSING_SERVICE_CONFIG = "Service %service% is declared as parameter but could not be find in configuration";

var Barman = function () {
    function Barman() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Barman);

        this.bottle = new _bottlejs2.default();
        if (!config.services) {
            config.services = [];
        }
        this.config = config;
        this.initialize();
    }

    _createClass(Barman, [{
        key: "initialize",
        value: function initialize() {
            // Throws an error if a cyclic dependency is detected
            // or if a service is missing in the container
            this.checkConfigDependencies(this.config);
            this.registerParameters();
            this.registerServices();
        }
    }, {
        key: "getContainer",
        value: function getContainer() {
            return this.bottle.container;
        }
    }, {
        key: "get",
        value: function get(serviceName) {
            return this.getContainer()[serviceName];
        }
    }, {
        key: "getParameter",
        value: function getParameter(parameterName) {
            return this.getContainer()[parameterName];
        }
    }, {
        key: "registerParameters",
        value: function registerParameters() {
            if (this.config.parameters) {
                var parameters = this.config.parameters;
                for (var i in parameters) {
                    this.bottle.value(i, parameters[i]);
                }
            }
        }
    }, {
        key: "registerServices",
        value: function registerServices() {
            var _this = this;

            if (this.config.services) {
                var services = this.config.services.slice();
                while (services.length > 0) {
                    for (var key in services) {
                        try {
                            (function () {
                                var service = _this.config.services[key];
                                _this.checkContainerDependencies(_this.config, service);
                                _this.registerService(service);
                                services = services.filter(function (serv) {
                                    return serv.name !== service.name;
                                });
                            })();
                        } catch (e) {
                            if (!e.message.startsWith('Service dependency not found in container. Looked for ')) {
                                throw e;
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: "registerService",
        value: function registerService(service) {
            this.bottle.factory(service.name, function (container) {
                var instances = [];
                for (var i in service.parameters) {
                    instances.push(container[service.parameters[i]]);
                }

                return new (Function.prototype.bind.apply(service.definition, [null].concat(instances)))();
            });
        }
    }, {
        key: "checkConfigDependencies",
        value: function checkConfigDependencies(config) {
            if (config.services) {
                for (var i in config.services) {
                    var service = config.services[i];
                    if (service.parameters) {
                        if (!Array.isArray(service.parameters)) {
                            throw new Error('Bad argument exception; Expect parameters to be array, ' + _typeof(service.parameters) + ' given');
                        }
                        for (var _i in service.parameters) {
                            if (!this.configHasService(config, service.parameters[_i])) {
                                throw new Error(MISSING_SERVICE_CONFIG.replace('%service%', service.parameters[_i]));
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: "findService",
        value: function findService(config, serviceName) {
            return config.services.find(function (service) {
                return service.name === serviceName;
            });
        }
    }, {
        key: "configHasService",
        value: function configHasService(config, serviceName) {
            return undefined !== this.findService(config, serviceName);
        }
    }, {
        key: "checkContainerDependencies",
        value: function checkContainerDependencies(config, service) {
            var dependencies = service.parameters;

            if (undefined !== dependencies) {
                // Assumes this is as an array has it has already been checked
                for (var i in dependencies) {
                    var dependency = dependencies[i];
                    var serviceDependency = this.findService(config, dependency);

                    if (undefined !== serviceDependency && undefined !== serviceDependency.parameters && serviceDependency.parameters.indexOf(service.name) !== -1) {
                        throw new Error('Cyclic dependency detected');
                    }

                    if (undefined === this.bottle.container[dependencies[i]]) {
                        throw new Error('Service dependency not found in container. Looked for ' + dependencies[i]);
                    }
                }
            }
        }
    }], [{
        key: "shake",
        value: function shake(config) {
            var finalConfig = {};
            if (config.resources) {
                for (var i in config.resources) {
                    finalConfig = Barman.merge(config, config.resources[i]);
                }
            }

            return finalConfig;
        }
    }, {
        key: "merge",
        value: function merge(array1, array2) {
            var finalArray = array1;
            for (var i in array1) {
                if (array2[i]) {
                    // Check types
                    if (_typeof(array1[i]) !== _typeof(array2[i])) {
                        throw new Error("Could not merge type " + _typeof(array1[i]) + " with type " + _typeof(array2[i]) + " on key " + i);
                    }

                    if (Array.isArray(array1[i]) && !Array.isArray(array2[i]) || !Array.isArray(array1[i]) && Array.isArray(array2[i])) {
                        var typeArray1 = Array.isArray(array1[i]) ? "array" : _typeof(array1[i]);
                        var typeArray2 = Array.isArray(array2[i]) ? "array" : _typeof(array2[i]);
                        throw new Error("Could not merge type " + typeArray1 + " with type " + typeArray2 + " on key " + i);
                    }

                    if (Array.isArray(array1[i]) && Array.isArray(array2[i])) {
                        finalArray[i] = array1[i].concat(array2[i]);
                    } else if ("string" === typeof array1[i]) {
                        finalArray[i] = array2[i];
                    } else {
                        finalArray[i] = Object.assign({}, array1[i], array2[i]);
                    }
                }
            }

            return finalArray;
        }
    }]);

    return Barman;
}();

exports.default = Barman;
;
