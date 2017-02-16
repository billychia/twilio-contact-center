'use strict'

module.exports.assignment = function (req, res) {
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Cache-Control', 'public, max-age=0')
	if (req.body.TaskQueueSid === 'WQda51d7c3d837b4cb954e3ea38a492f1b') {
		var taskAttributes = JSON.parse(req.body.TaskAttributes)
		var responseAttributes = {
  			"instruction": "redirect",
			"call_sid": taskAttributes.call_sid,
			"url": "/spam-filter/ivr",
		}
		console.log('we have a match', JSON.parse(req.body.TaskAttributes).call_sid)
		//res.send(JSON.stringify({ }, null, 3))
		res.send(JSON.stringify(responseAttributes))
	} else {
		console.log('no match')
		res.send(JSON.stringify({ }, null, 3))
	}

}
