# barmanjs

A minimalist application to support [bottlejs](https://github.com/young-steveo/bottlejs) dependency injection through a simple configuration file.

## Configuration format

All you need is to declare a simple JS file with the following format:
```
import MyFirstService from './my-first-service';
import MySecondService from './my-second-service

services: [
  {
    name: 'my.first-service',
    definition: MyFirstService,
    parameters: ['my.second-service']
  },
  {
    name: 'my.second-service',
    definition: MySecondService
  }
]
```
Services can be declared in a random order as the Barman will handle dependencies

## Cyclic dependencies
Cyclic dependencies are not supported and a `Cyclic dependency detected` Error will be triggered.

