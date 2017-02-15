'use strict'

module.exports.assignment = function (req, res) {
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Cache-Control', 'public, max-age=0')
	if (req.body.TaskQueueSid === 'WQf4928f98b7083176a9920b4a397d3c78') {
		var taskAttributes = JSON.parse(req.body.TaskAttributes)
		var responseAttributes = {
  			"instruction": "redirect",
			"call_sid": taskAttributes.call_sid,
			"url": "/ivr/welcome",
		}
		console.log('we have a match', JSON.parse(req.body.TaskAttributes).call_sid)
		//res.send(JSON.stringify({ }, null, 3))
		res.send(JSON.stringify(responseAttributes))
	} else {
		console.log('no match')
		res.send(JSON.stringify({ }, null, 3))
	}

}
