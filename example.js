const pull = require('pull-stream')
const compute = require('./')

pull(
  pull.count(),
  pull.take(10),
  compute(function (value, cb) {
    cb(null, value * value)
  }),
  pull.log()
)
