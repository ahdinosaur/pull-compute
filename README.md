# pull-compute

compute across [multiple threads](https://github.com/audreyt/node-webworker-threads) using [pull streams](https://pull-stream.github.io/)

```shell
npm install --save pull-compute
```

## example

```js
const pull = require('pull-stream')
const compute = require('pull-compute')

pull(
  pull.count(),
  pull.take(10),
  compute(function (value, cb) {
    cb(null, value * value)
  }),
  pull.log()
)
```

```txt
0
1
4
9
16
25
36
49
64
81
```

## usage

### `compute = require('pull-compute')`

### `through = compute(fn, width)`

`fn` is a function with signature `(data, cb) => { cb(error, result) }`.

for now, `fn` must be a function that contains all source necessary to run itself. (cannot be a closure that depends on hidden values.)

`width` is how many computations to run in parallel.

stream returns results in the same order as they went in.

## license

The Apache License

Copyright &copy; 2016 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
