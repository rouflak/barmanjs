/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _bottlejs = __webpack_require__(1);

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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {;(function(undefined) {
	    'use strict';
	    /**
	     * BottleJS v1.2.3 - 2016-03-04
	     * A powerful dependency injection micro container
	     *
	     * Copyright (c) 2016 Stephen Young
	     * Licensed MIT
	     */
	    
	    /**
	     * Unique id counter;
	     *
	     * @type Number
	     */
	    var id = 0;
	    
	    /**
	     * Local slice alias
	     *
	     * @type Functions
	     */
	    var slice = Array.prototype.slice;
	    
	    /**
	     * Map of fullnames by index => name
	     *
	     * @type Array
	     */
	    var fullnameMap = [];
	    
	    /**
	     * Iterator used to flatten arrays with reduce.
	     *
	     * @param Array a
	     * @param Array b
	     * @return Array
	     */
	    var concatIterator = function concatIterator(a, b) {
	        return a.concat(b);
	    };
	    
	    /**
	     * Get a group (middleware, decorator, etc.) for this bottle instance and service name.
	     *
	     * @param Array collection
	     * @param Number id
	     * @param String name
	     * @return Array
	     */
	    var get = function get(collection, id, name) {
	        var group = collection[id];
	        if (!group) {
	            group = collection[id] = {};
	        }
	        if (name && !group[name]) {
	            group[name] = [];
	        }
	        return name ? group[name] : group;
	    };
	    
	    /**
	     * Will try to get all things from a collection by name, by __global__, and by mapped names.
	     *
	     * @param Array collection
	     * @param Number id
	     * @param String name
	     * @return Array
	     */
	    var getAllWithMapped = function(collection, id, name) {
	        return get(fullnameMap, id, name)
	            .map(getMapped.bind(null, collection))
	            .reduce(concatIterator, get(collection, id, name))
	            .concat(get(collection, id, '__global__'));
	    };
	    
	    /**
	     * Iterator used to get decorators from a map
	     *
	     * @param Array collection
	     * @param Object data
	     * @return Function
	     */
	    var getMapped = function getMapped(collection, data) {
	        return get(collection, data.id, data.fullname);
	    };
	    
	    /**
	     * Iterator used to walk down a nested object.
	     *
	     * If Bottle.config.strict is true, this method will throw an exception if it encounters an
	     * undefined path
	     *
	     * @param Object obj
	     * @param String prop
	     * @return mixed
	     * @throws
	     */
	    var getNested = function getNested(obj, prop) {
	        var service = obj[prop];
	        if (service === undefined && globalConfig.strict) {
	            throw new Error('Bottle was unable to resolve a service.  `' + prop + '` is undefined.');
	        }
	        return service;
	    };
	    
	    /**
	     * Get a service stored under a nested key
	     *
	     * @param String fullname
	     * @return Service
	     */
	    var getNestedService = function getNestedService(fullname) {
	        return fullname.split('.').reduce(getNested, this);
	    };
	    
	    /**
	     * A helper function for pushing middleware and decorators onto their stacks.
	     *
	     * @param Array collection
	     * @param String name
	     * @param Function func
	     */
	    var set = function set(collection, id, name, func) {
	        if (typeof name === 'function') {
	            func = name;
	            name = '__global__';
	        }
	        get(collection, id, name).push(func);
	    };
	    
	    /**
	     * Register a constant
	     *
	     * @param String name
	     * @param mixed value
	     * @return Bottle
	     */
	    var constant = function constant(name, value) {
	        var parts = name.split('.');
	        name = parts.pop();
	        defineConstant.call(parts.reduce(setValueObject, this.container), name, value);
	        return this;
	    };
	    
	    var defineConstant = function defineConstant(name, value) {
	        Object.defineProperty(this, name, {
	            configurable : false,
	            enumerable : true,
	            value : value,
	            writable : false
	        });
	    };
	    
	    /**
	     * Map of decorator by index => name
	     *
	     * @type Object
	     */
	    var decorators = [];
	    
	    /**
	     * Register decorator.
	     *
	     * @param String name
	     * @param Function func
	     * @return Bottle
	     */
	    var decorator = function decorator(name, func) {
	        set(decorators, this.id, name, func);
	        return this;
	    };
	    
	    /**
	     * Map of deferred functions by id => name
	     *
	     * @type Object
	     */
	    var deferred = [];
	    
	    /**
	     * Register a function that will be executed when Bottle#resolve is called.
	     *
	     * @param Function func
	     * @return Bottle
	     */
	    var defer = function defer(func) {
	        set(deferred, this.id, func);
	        return this;
	    };
	    
	    
	    /**
	     * Immediately instantiates the provided list of services and returns them.
	     *
	     * @param Array services
	     * @return Array Array of instances (in the order they were provided)
	     */
	    var digest = function digest(services) {
	        return (services || []).map(getNestedService, this.container);
	    };
	    
	    /**
	     * Register a factory inside a generic provider.
	     *
	     * @param String name
	     * @param Function Factory
	     * @return Bottle
	     */
	    var factory = function factory(name, Factory) {
	        return provider.call(this, name, function GenericProvider() {
	            this.$get = Factory;
	        });
	    };
	    
	    /**
	     * Map of middleware by index => name
	     *
	     * @type Object
	     */
	    var middles = [];
	    
	    /**
	     * Function used by provider to set up middleware for each request.
	     *
	     * @param Number id
	     * @param String name
	     * @param Object instance
	     * @param Object container
	     * @return void
	     */
	    var applyMiddleware = function applyMiddleware(id, name, instance, container) {
	        var middleware = getAllWithMapped(middles, id, name);
	        var descriptor = {
	            configurable : true,
	            enumerable : true
	        };
	        if (middleware.length) {
	            descriptor.get = function getWithMiddlewear() {
	                var index = 0;
	                var next = function nextMiddleware(err) {
	                    if (err) {
	                        throw err;
	                    }
	                    if (middleware[index]) {
	                        middleware[index++](instance, next);
	                    }
	                };
	                next();
	                return instance;
	            };
	        } else {
	            descriptor.value = instance;
	            descriptor.writable = true;
	        }
	    
	        Object.defineProperty(container, name, descriptor);
	    
	        return container[name];
	    };
	    
	    /**
	     * Register middleware.
	     *
	     * @param String name
	     * @param Function func
	     * @return Bottle
	     */
	    var middleware = function middleware(name, func) {
	        set(middles, this.id, name, func);
	        return this;
	    };
	    
	    /**
	     * Named bottle instances
	     *
	     * @type Object
	     */
	    var bottles = {};
	    
	    /**
	     * Get an instance of bottle.
	     *
	     * If a name is provided the instance will be stored in a local hash.  Calling Bottle.pop multiple
	     * times with the same name will return the same instance.
	     *
	     * @param String name
	     * @return Bottle
	     */
	    var pop = function pop(name) {
	        var instance;
	        if (name) {
	            instance = bottles[name];
	            if (!instance) {
	                bottles[name] = instance = new Bottle();
	                instance.constant('BOTTLE_NAME', name);
	            }
	            return instance;
	        }
	        return new Bottle();
	    };
	    
	    /**
	     * Map of nested bottles by index => name
	     *
	     * @type Array
	     */
	    var nestedBottles = [];
	    
	    /**
	     * Map of provider constructors by index => name
	     *
	     * @type Array
	     */
	    var providerMap = [];
	    
	    /**
	     * Used to process decorators in the provider
	     *
	     * @param Object instance
	     * @param Function func
	     * @return Mixed
	     */
	    var reducer = function reducer(instance, func) {
	        return func(instance);
	    };
	    
	    /**
	     * Register a provider.
	     *
	     * @param String fullname
	     * @param Function Provider
	     * @return Bottle
	     */
	    var provider = function provider(fullname, Provider) {
	        var parts, providers, name, factory;
	        providers = get(providerMap, this.id);
	        parts = fullname.split('.');
	        if (providers[fullname] && parts.length === 1 && !this.container[fullname + 'Provider']) {
	            return console.error(fullname + ' provider already instantiated.');
	        }
	        providers[fullname] = true;
	    
	        name = parts.shift();
	        factory = parts.length ? createSubProvider : createProvider;
	    
	        return factory.call(this, name, Provider, fullname, parts);
	    };
	    
	    /**
	     * Create the provider properties on the container
	     *
	     * @param String fullname
	     * @param String name
	     * @param Function Provider
	     * @return Bottle
	     */
	    var createProvider = function createProvider(name, Provider) {
	        var providerName, properties, container, id;
	    
	        id = this.id;
	        container = this.container;
	        providerName = name + 'Provider';
	    
	        properties = Object.create(null);
	        properties[providerName] = {
	            configurable : true,
	            enumerable : true,
	            get : function getProvider() {
	                var instance = new Provider();
	                delete container[providerName];
	                container[providerName] = instance;
	                return instance;
	            }
	        };
	    
	        properties[name] = {
	            configurable : true,
	            enumerable : true,
	            get : function getService() {
	                var provider = container[providerName];
	                var instance;
	                if (provider) {
	                    // filter through decorators
	                    instance = getAllWithMapped(decorators, id, name)
	                        .reduce(reducer, provider.$get(container));
	    
	                    delete container[providerName];
	                    delete container[name];
	                }
	                return instance === undefined ? instance : applyMiddleware(id, name, instance, container);
	            }
	        };
	    
	        Object.defineProperties(container, properties);
	        return this;
	    };
	    
	    /**
	     * Creates a bottle container on the current bottle container, and registers
	     * the provider under the sub container.
	     *
	     * @param String name
	     * @param Function Provider
	     * @param String fullname
	     * @param Array parts
	     * @return Bottle
	     */
	    var createSubProvider = function createSubProvider(name, Provider, fullname, parts) {
	        var bottle, bottles, subname, id;
	    
	        id = this.id;
	        bottles = get(nestedBottles, id);
	        bottle = bottles[name];
	        if (!bottle) {
	            this.container[name] = (bottle = bottles[name] = Bottle.pop()).container;
	        }
	        subname = parts.join('.');
	        bottle.provider(subname, Provider);
	    
	        set(fullnameMap, bottle.id, subname, { fullname : fullname, id : id });
	    
	        return this;
	    };
	    
	    /**
	     * Register a service, factory, provider, or value based on properties on the object.
	     *
	     * properties:
	     *  * Obj.$name   String required ex: `'Thing'`
	     *  * Obj.$type   String optional 'service', 'factory', 'provider', 'value'.  Default: 'service'
	     *  * Obj.$inject Mixed  optional only useful with $type 'service' name or array of names
	     *  * Obj.$value  Mixed  optional Normally Obj is registered on the container.  However, if this
	     *                       property is included, it's value will be registered on the container
	     *                       instead of the object itsself.  Useful for registering objects on the
	     *                       bottle container without modifying those objects with bottle specific keys.
	     *
	     * @param Function Obj
	     * @return Bottle
	     */
	    var register = function register(Obj) {
	        var value = Obj.$value === undefined ? Obj : Obj.$value;
	        return this[Obj.$type || 'service'].apply(this, [Obj.$name, value].concat(Obj.$inject || []));
	    };
	    
	    
	    /**
	     * Execute any deferred functions
	     *
	     * @param Mixed data
	     * @return Bottle
	     */
	    var resolve = function resolve(data) {
	        get(deferred, this.id, '__global__').forEach(function deferredIterator(func) {
	            func(data);
	        });
	    
	        return this;
	    };
	    
	    /**
	     * Register a service inside a generic factory.
	     *
	     * @param String name
	     * @param Function Service
	     * @return Bottle
	     */
	    var service = function service(name, Service) {
	        var deps = arguments.length > 2 ? slice.call(arguments, 2) : null;
	        var bottle = this;
	        return factory.call(this, name, function GenericFactory() {
	            if (deps) {
	                deps = deps.map(getNestedService, bottle.container);
	                deps.unshift(Service);
	                Service = Service.bind.apply(Service, deps);
	            }
	            return new Service();
	        });
	    };
	    
	    /**
	     * Register a value
	     *
	     * @param String name
	     * @param mixed val
	     * @return
	     */
	    var value = function value(name, val) {
	        var parts;
	        parts = name.split('.');
	        name = parts.pop();
	        defineValue.call(parts.reduce(setValueObject, this.container), name, val);
	        return this;
	    };
	    
	    /**
	     * Iterator for setting a plain object literal via defineValue
	     *
	     * @param Object container
	     * @param string name
	     */
	    var setValueObject = function setValueObject(container, name) {
	        var nestedContainer = container[name];
	        if (!nestedContainer) {
	            nestedContainer = {};
	            defineValue.call(container, name, nestedContainer);
	        }
	        return nestedContainer;
	    };
	    
	    /**
	     * Define a mutable property on the container.
	     *
	     * @param String name
	     * @param mixed val
	     * @return void
	     * @scope container
	     */
	    var defineValue = function defineValue(name, val) {
	        Object.defineProperty(this, name, {
	            configurable : true,
	            enumerable : true,
	            value : val,
	            writable : true
	        });
	    };
	    
	    
	    /**
	     * Bottle constructor
	     *
	     * @param String name Optional name for functional construction
	     */
	    var Bottle = function Bottle(name) {
	        if (!(this instanceof Bottle)) {
	            return Bottle.pop(name);
	        }
	    
	        this.id = id++;
	        this.container = { $register : register.bind(this) };
	    };
	    
	    /**
	     * Bottle prototype
	     */
	    Bottle.prototype = {
	        constant : constant,
	        decorator : decorator,
	        defer : defer,
	        digest : digest,
	        factory : factory,
	        middleware : middleware,
	        provider : provider,
	        register : register,
	        resolve : resolve,
	        service : service,
	        value : value
	    };
	    
	    /**
	     * Bottle static
	     */
	    Bottle.pop = pop;
	    
	    /**
	     * Global config
	     */
	    var globalConfig = Bottle.config = {
	        strict : false
	    };
	    
	    /**
	     * Exports script adapted from lodash v2.4.1 Modern Build
	     *
	     * @see http://lodash.com/
	     */
	    
	    /**
	     * Valid object type map
	     *
	     * @type Object
	     */
	    var objectTypes = {
	        'function' : true,
	        'object' : true
	    };
	    
	    (function exportBottle(root) {
	    
	        /**
	         * Free variable exports
	         *
	         * @type Function
	         */
	        var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
	    
	        /**
	         * Free variable module
	         *
	         * @type Object
	         */
	        var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
	    
	        /**
	         * CommonJS module.exports
	         *
	         * @type Function
	         */
	        var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
	    
	        /**
	         * Free variable `global`
	         *
	         * @type Object
	         */
	        var freeGlobal = objectTypes[typeof global] && global;
	        if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	            root = freeGlobal;
	        }
	    
	        /**
	         * Export
	         */
	        if (true) {
	            root.Bottle = Bottle;
	            !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return Bottle; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        } else if (freeExports && freeModule) {
	            if (moduleExports) {
	                (freeModule.exports = Bottle).Bottle = Bottle;
	            } else {
	                freeExports.Bottle = Bottle;
	            }
	        } else {
	            root.Bottle = Bottle;
	        }
	    }((objectTypes[typeof window] && window) || this));
	    
	}.call(this));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module), (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ]);