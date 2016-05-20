import Bottle from "bottlejs";

const MISSING_SERVICE_CONFIG = "Service %service% is declared as parameter but could not be find in configuration";

export default class Barman {
    constructor(config = {}) {
        this.bottle = new Bottle();
        if (!config.services) {
            config.services = [];
        }
        this.config = config;
        this.initialize();
    }

    initialize() {
        // Throws an error if a cyclic dependency is detected
        // or if a service is missing in the container
        this.checkConfigDependencies(this.config);
        this.registerParameters();
        this.registerServices();

    }

    getContainer() {
        return this.bottle.container;
    }

    get(serviceName) {
        return this.getContainer()[serviceName];
    }

    getParameter(parameterName) {
        return this.getContainer()[parameterName];
    }

    static shake(config) {
        let finalConfig = {};
        if (config.resources) {
            for (let i in config.resources) {
                finalConfig = Barman.merge(config, config.resources[i]);
            }
        }

        return finalConfig;
    }

    static merge(array1, array2) {
        let finalArray = array1;
        for (let i in array1) {
            if (array2[i]) {
                // Check types
                if (typeof(array1[i]) !== typeof(array2[i])) {
                    throw new Error("Could not merge type "+typeof array1[i]+" with type "+typeof array2[i]+" on key "+i);
                }

                if (Array.isArray(array1[i])
                    && !Array.isArray(array2[i])
                    || !Array.isArray(array1[i])
                    && Array.isArray(array2[i])) {
                    let typeArray1 = Array.isArray(array1[i]) ? "array" : typeof array1[i];
                    let typeArray2 = Array.isArray(array2[i]) ? "array" : typeof array2[i];
                    throw new Error("Could not merge type "+typeArray1+" with type "+typeArray2+" on key "+i);
                }

                if (Array.isArray(array1[i])
                    && Array.isArray(array2[i])) {
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

    registerParameters() {
        if (this.config.parameters) {
            let parameters = this.config.parameters;
            for (let i in parameters) {
                this.bottle.value(i, parameters[i]);
            }
        }
    }

    registerServices() {
        if (this.config.services) {
            let services = this.config.services.slice();
            while (services.length > 0) {
                for (let key in services) {
                    try {
                        let service = this.config.services[key];
                        this.checkContainerDependencies(this.config, service);
                        this.registerService(service);
                        services = services.filter(function (serv) {
                            return serv.name !== service.name;
                        });
                    } catch(e) {
                        if (!e.message.startsWith('Service dependency not found in container. Looked for ')) {
                            throw e
                        }
                    }
                }
            }
        }
    }

    registerService(service) {
        this.bottle.factory(service.name, function (container) {
            let instances = [];
            for (let i in service.parameters) {
                instances.push(container[service.parameters[i]]);
            }

            return new service.definition(...instances);
        });
    }

    checkConfigDependencies(config) {
        if (config.services) {
            for (let i in config.services) {
                let service = config.services[i];
                if (service.parameters) {
                    if (!Array.isArray(service.parameters)) {
                        throw new Error('Bad argument exception; Expect parameters to be array, ' + typeof(service.parameters) + ' given');
                    }
                    for (let i in service.parameters) {
                        if (!this.configHasService(config, service.parameters[i])) {
                            throw new Error(MISSING_SERVICE_CONFIG.replace('%service%', service.parameters[i]));
                        }
                    }
                }
            }
        }
    }

    findService(config, serviceName) {
        return config.services.find((service) =>
            service.name === serviceName
        );
    }

    configHasService(config, serviceName) {
        return undefined !== this.findService(config, serviceName);
    }

    checkContainerDependencies(config, service) {
        let dependencies = service.parameters;

        if (undefined !== dependencies) {
            // Assumes this is as an array has it has already been checked
            for (let i in dependencies) {
                let dependency = dependencies[i];
                let serviceDependency = this.findService(config, dependency);

                if (undefined !== serviceDependency
                    && undefined !== serviceDependency.parameters
                    && serviceDependency.parameters.indexOf(service.name) !== -1) {
                    throw new Error('Cyclic dependency detected');
                }

                if (undefined === this.bottle.container[dependencies[i]]) {
                    throw new Error('Service dependency not found in container. Looked for ' + dependencies[i]);
                }
            }
        }
    }
};
