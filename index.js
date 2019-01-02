'use strict'

let customerToken = process.env.CUSTOMER_TOKEN
let tag = 'cloudwatch'

var zlib = require('zlib')
const { promisify } = require('util')
	
var FluentLogger = require('fluent-logger'),
	EventTime = FluentLogger.EventTime,	
    fluent = FluentLogger.createFluentSender(tag, {
      host: 'logs.logsense.com',
      port: 32714,
      timeout: 0.0,
      reconnectInterval: 100,
      requireAckResponse: true,
      enableReconnect: false,
      tls: true
    })
	
fluent.on('Error', (error) => {
  console.log(error);
})

fluent.on('connect', () => {
  console.log('Connected!');
})

function emitLog(logGroupName, logStreamName, timestamp, message, callback) {
  let eventTime = EventTime.fromTimestamp(timestamp)

  fluent.emit(tag, {
    cs_pattern_key: 'message',
    cs_customer_token: customerToken,
    log_stream_name: logStreamName,
    log_group_name: logGroupName,
    message: message},
    eventTime,
    callback)
}

async function processLogs(event, context) {
  var payload = new Buffer(event.awslogs.data, 'base64')

  const result = await promisify(zlib.gunzip)(payload)

    let logs = JSON.parse(result.toString('ascii'));
    console.log("Parsed ", logs.logEvents.length, "log events")
    await Promise.all(logs.logEvents.map(async (log) => {
        var ts = Date.now()
        await promisify(emitLog)(
            logs.logGroup,
            logs.logStream,
            // log.timestamp,
            ts,
            log.message.trim())
    }))

    await promisify(fluent.end).call(fluent)
    // setTimeout(function () { fluent.end() }, 500);
}


exports.handler = async function(event, context) {
  await processLogs(event, context)
};

// async function test() {
//     var event = {
//         "awslogs": {
//             "data": "H4sIAAAAAAAAAFWQT0+DQBTEvwrZeCxh3+7bf9xIxMZELwW9VGKW7kJIClSgNqbpd3er9eB13sv8ZuZMej/PtvXl18GTlNxnZfb+nBdFts7JioynwU9BZgYAFAMjQQZ5P7braTwewiWxpznZ2752Ntn4j6Ofl5eh243T8PtXLJO3/dWCgkkoJJQl27unrMyLskLhauYkCNF41JYbIzSAlQ1tRG0aFizmYz3vpu6wdOPw0O0XP80k3ZL/qHLq2jYErX6Q+acfluvXmXQukDmiVpwbDUgl44Yi4wwVM8pwAKaUoVRKgWgUE6g5VQY5Mgz0pQvzLLYPTUGgRCk0ZQz56m+2YF+U2aaMboEeXRqJWtmdoy6m3ukYwJu4llbEVtQBo0XDNI9eQ5FQKY1uW7wN5FJdvgGXWEuFjwEAAA=="
//         }
//     }
//     console.log("Starting..")
//     await processLogs(event, null)
//     console.log("Finished..")
// }
//
// test()