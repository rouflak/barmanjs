import Bottle from "bottlejs";

export default class Barman
{
    constructor(config = {}) {
        this.bottle = new Bottle();
        if (!config.services) {
            config.services = [];
        }
        this.config = config;
        this.initialize();
    }

    initialize() {
        if (this.config.services) {
            let services = this.config.services.slice();
            while(services.length > 0) {
                for (let key in services) {
                    let service = this.config.services[key];
                    try {
                        this.checkDependencies(this.config, service);
                        this.bottle.factory(service.name, function(container) {
                            let instances = [];
                            for (let i in service.parameters) {
                                instances.push(container[service.parameters[i]]);
                            }

                            return new service.definition(...instances);
                        });
                        services = services.filter(function(serv) {
                            return serv.name !== service.name;
                        });
                    } catch(e) {
                        if (!e.message.startsWith('Service dependency not found in container')) {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    checkDependencies(serviceConfig, service) {
        let dependencies = service.parameters;

        if (undefined !== dependencies) {
            if (!Array.isArray(dependencies)) {
                throw new Error('Bad argument exception; Expect parameters to be array, '+typeof(dependencies)+' given');
            }
            for (let i in dependencies) {
                let dependency = dependencies[i];
                let serviceDependency = serviceConfig.services.find(function(serv) {
                    return serv.name === dependency;
                });

                if (undefined !== serviceDependency
                    && undefined !== serviceDependency.parameters
                    && serviceDependency.parameters.indexOf(service.name) !== -1) {
                    throw new Error('Cyclic dependency detected');
                }

                if (undefined === this.bottle.container[dependencies[i]]) {
                    throw new Error('Service dependency not found in container while looking for '+dependencies[i]);
                }
            }
        }
    }
}
