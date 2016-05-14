import Bottle from "bottlejs";

export default class Container
{
    constructor(config = []) {
        this.bottle = new Bottle();
        this.initialize(config);
    }

    initialize(config) {
        for (let i in config.services) {
            let service = config.services[i];
            this.bottle.service(service.name, service.definition);
        }
    }
}
