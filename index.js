const pull = require('pull-stream/pull')
const drain = require('pull-stream/sinks/drain')
const Worker = require('webworker-threads').Worker
const Pushable = require('pull-pushable')

// TODO
// do as a map async
//
// stream
// - read next value
// - generate id for this task
// - send task to next ready worker
// - register task id with callback
//

module.exports = compute

function compute (computation) {
  const work = parseFunction(`function () {
    const computation = ${stringifyFunction(computation)}
    this.onmessage = function (ev) {
      const data = ev.data
      computation(data, function (err, result) {
        if (err) {
          postMessage({ error: err })
          self.close()
        } else {
          postMessage({ result })
        }
      })
    }
  }`)
  const worker = new Worker(work)
  var end
  const results = Pushable(function (err) {
    if (!end) drainer.abort(err)
    end = err || true
  })

  const drainer = drain(function (data) {
    worker.postMessage(data)
  }, function (err) {
    if (err === null) {
      setTimeout(function () {
        end = true
        results.end()
      }, 100)
      return
    }
    if (!end) results.end(err)
    end = err || true
  })

  worker.onmessage = function (ev) {
    const data = ev.data || {}
    const error = data.error
    const result = data.result
      
    if (error) {
      results.end(error)
    } else {
      results.push(result)
    }
  }

  return function (read) {
    pull(read, drainer)
    return results
  }
}

function parseFunction (str) {
  str = '' + str

  if(str.substr(0, 8) !== 'function') {
    throw new TypeError('Invalid input: ' + str)
  }

  return new Function('return (' + str + ')')()
}

function stringifyFunction (fn) {
  if(!(fn && (fn instanceof Function))) {
    throw new TypeError('Argument is not Function')
  }

  const str = fn.toString()

  if (str.substr(0, 8) !== 'function') {
    throw new TypeError('Failed to serialize function: ' + fn)
  }

  return str
}
