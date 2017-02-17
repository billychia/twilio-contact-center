'use strict'
var tasks = require('./tasks.js')

module.exports.assignment = function (req, res) {
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Cache-Control', 'public, max-age=0')
	if (req.body.TaskQueueSid === 'WQ2a26c93efbec4e322de39f535f4c5eb1') {
		var taskAttributes = JSON.parse(req.body.TaskAttributes)
		var responseAttributes = {
  			"instruction": "redirect",
			"call_sid": taskAttributes.call_sid,
			"url": req.protocol + '://' + req.hostname + '/api/spam-filter/ivr',
			"accept": true
		}
		console.log('oh no, possible spam')
		res.send(JSON.stringify(responseAttributes))
	} else {
		console.log('not spam, whew!')
		res.send(JSON.stringify({ }, null, 3))
	}

}

module.exports.event = function (req, res) {
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Cache-Control', 'public, max-age=0')
	if (req.body.EventType === 'reservation.accepted' &&
		req.body.WorkerSid === 'WKbe159d40694c4634f9145c23209ee93f') {

		var taskParams = {
				assignmentStatus: 'completed',
				reason: 'spam bot qualified'
		}
		tasks.updateTask(req, res, taskParams);

		var workerParams = {
		    ActivitySid: req.configuration.twilio.workerIdleActivitySid
		}
		tasks.updateWorker(req, res, workerParams);
	}

	res.status(200).end()
}
