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
        expect(() => barman.checkDependencies(config, service)).toThrow(new Error('Service dependency not found in container while looking for subServiceTest'));

        service = {
            name: 'serviceTest',
            definition: SubServiceTest
        };
        config = {
            services: [service]
        };

        expect(barman.checkDependencies(config, service)).toBeUndefined();
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

        expect(function() {barman.checkDependencies(configs, config)}).toThrow(new Error('Cyclic dependency detected'));

    });
});
