const pull = require('pull-stream')
const compute = require('./')

pull(
  pull.values([0, 1, 2, 3, 4, 5]),
  compute(function (value, cb) {
    cb(null, value * value)
  }),
  pull.log()
)
