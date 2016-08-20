const pull = require('pull-stream/pull')
const through = require('pull-stream/throughs/through')
const map = require('pull-paramap')
const Worker = require('webworker-threads').Worker

module.exports = compute

function compute (fn) {
  const worker = createWorker(fn)

  var id = 0
  var jobs = {}
  var end

  worker.onmessage = function (ev) {
    const data = ev.data
    const cb = jobs[data.jobId]
    delete jobs[data.jobId]
      
    if (data.error) {
      cb(data.error)
    } else {
      cb(null, data.result)
    }
  }

  return pull(
    map(function (data, cb) {
      const jobId = id++
      jobs[jobId] = cb

      worker.postMessage({
        jobId,
        data
      })
    }, 4),
    through(null, function (abort) {
      worker.terminate()
    })
  )
}

function createWorker (fn) {
  const work = parseFunction(`function () {
    const computation = ${stringifyFunction(fn)}
    this.onmessage = function (ev) {
      const jobId = ev.data.jobId
      const data = ev.data.data
      computation(data, function (err, result) {
        if (err) {
          postMessage({ jobId, error: err })
          self.close()
        } else {
          postMessage({ jobId, result })
        }
      })
    }
  }`)

  return new Worker(work)
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
