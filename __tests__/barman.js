jest.autoMockOff();


describe('Barman', function() {
    let Barman = require("../src/barman").default;

    class ServiceTest
    {
        constructor(test, subTest2) {this.test = test; this.subTest2 = subTest2}
    }
    class SubServiceTest
    {
        constructor() {}
    }
    class SubServiceTest2
    {
        constructor() {}
    }


    it("should return the container of the bottle", () => {
        let barman = new Barman();
        expect(barman.bottle.container).toEqual(barman.getContainer());
    });

    it ("should register a parameter from the config", () => {
        let config = {
            parameters: {
                parameter1: "test",
                parameter2: "test2"
            }
        };

        let barman = new Barman(config);

        expect(barman.getParameter('parameter1')).toEqual("test");
    });

    it ("should check the configuration", () => {
        let config = {
            services: [
                {
                    name: 'serviceTest',
                    definition: ServiceTest,
                    parameters: ['subService', 'missingService']
                },
                {
                    name: 'subService',
                    definition: SubServiceTest
                }
            ]
        };

        let barman = new Barman();

        expect(() => {barman.checkConfigDependencies(config)}).toThrow(new Error('Service missingService declared as parameter but could not be fined in configuration'));

        config.services[1].parameters = "string";
        config.services[0].parameters = ['subService'];
        expect(() => {barman.checkConfigDependencies(config)}).toThrow(new Error('Bad argument exception; Expect parameters to be array, string given'))
    });

    it ("should find a service in the config", function() {
        let config = {
            services: [
                {
                    name: 'serviceTest',
                    definition: ServiceTest
                }
            ]
        };

        let barman = new Barman();

        expect(barman.findService(config, 'serviceTest')).toEqual(config.services[0]);
        expect(barman.findService(config, 'inexistingService')).toBeUndefined();
    });

    it("should check whether a config has a service or not", function() {
        let config = {
            services: [
                {
                    name: 'serviceTest',
                    definition: ServiceTest
                }
            ]
        };

        let barman = new Barman();

        expect(barman.configHasService(config, 'serviceTest')).toBeTruthy();
        expect(barman.configHasService(config, 'inexistingService')).toBeFalsy();
    });

    it("should check depdencies for the object", function () {
        let barman = new Barman();
        let service = {
            name: 'serviceTest',
            definition: ServiceTest,
            parameters: ['subServiceTest']
        };
        let config = {
            services: [service]
        };
        expect(() => barman.checkContainerDependencies(config, service)).toThrow(new Error('Service dependency not found in container. Looked for subServiceTest'));

        service = {
            name: 'serviceTest',
            definition: SubServiceTest
        };

        config = {
            services: [service]
        };

        expect(barman.checkContainerDependencies(config, service)).toBeUndefined();

    });

    it("should register a class in the barman's bottle container", function() {
        let config = {
            services: [
                {
                    name: 'serviceTest',
                    definition: ServiceTest,
                    parameters: ['subServiceTest', 'subServiceTest2']
                },
                {
                    name: 'subServiceTest',
                    definition: SubServiceTest
                },
                {
                    name: 'subServiceTest2',
                    definition: SubServiceTest2
                }
            ]
        };

        let barman = new Barman(config);
        let serviceTest = barman.bottle.container.serviceTest;

        expect(serviceTest instanceof ServiceTest).toBeTruthy();
        expect(serviceTest.test instanceof SubServiceTest).toBeTruthy();
        expect(serviceTest.subTest2 instanceof SubServiceTest2).toBeTruthy();
    });

    it("should get the service in the container", function() {
        let config = {
            services: [
                {
                    name: 'serviceTest',
                    definition: ServiceTest,
                    parameters: ['subServiceTest', 'subServiceTest2']
                },
                {
                    name: 'subServiceTest',
                    definition: SubServiceTest
                },
                {
                    name: 'subServiceTest2',
                    definition: SubServiceTest2
                }
            ]
        };

        let barman = new Barman(config);

        expect(barman.get("serviceTest") instanceof ServiceTest).toBeTruthy();
    });

    it("should throw an error if there is a cyclic dependency", function() {
        let config = {
            name: 'serviceTest',
            definition: ServiceTest,
            parameters: ['subServiceTest']
        };

        let config2 = {
            name: 'subServiceTest',
            definition: SubServiceTest,
            parameters: ['serviceTest']
        };

        let configs = {
            services: [config, config2]
        };

        let barman = new Barman();

        expect(function() {barman.checkContainerDependencies(configs, config)}).toThrow(new Error('Cyclic dependency detected'));
    });
});
