'use strict'

var twilio = require('twilio')
var tasks = require('./tasks.js')

module.exports.inbound = function (req, res) {
	/* set default team */
	var team = req.configuration.ivr.options[0]

	var twiml = new twilio.TwimlResponse()

	/* create task attributes */
	var attributes = {
		text: 'Call routed through spam filter to "' + team.friendlyName + '"',
		channel: 'phone',
		phone: req.query.From,
		name: req.query.From,
		title: 'Inbound call',
		type: 'inbound_call',
		team: team.id
	}

	twiml.enqueue({ workflowSid: req.configuration.twilio.workflowSid }, function (node) {
		node.task(JSON.stringify(attributes), {
			priority: 1,
			timeout: 3600
		})
	})

	res.setHeader('Content-Type', 'application/xml')
	res.setHeader('Cache-Control', 'public, max-age=0')
	res.send(twiml.toString())
}

module.exports.ivr = function (req, res) {
	var twiml = new twilio.TwimlResponse()

	twiml.gather({
		action: 'select-option',
		method: 'POST',
		numDigits: 1,
		timeout: 10
	}, function (node) {
		node.say("Press 1 if you want to talk to an agent, Press 2 if you want a callback")
	})

	res.setHeader('Content-Type', 'application/xml')
	res.setHeader('Cache-Control', 'public, max-age=0')
	res.send(twiml.toString())
}

module.exports.selectOption = function (req, res) {
	//console.log('select option req = ', req)
	var twiml = new twilio.TwimlResponse()
	var selectedOption = parseInt(req.body.Digits)
	var optionActions = {
        "1": talkToAnAgent,
        "2": requestCallback
    }

    if (optionActions[selectedOption]) {
		var team = req.configuration.ivr.options[0]
		/* create task attributes */
		var attributes = {
			text: 'Caller answered spam IVR with talk to an agent',
			channel: 'phone',
			phone: req.body.From,
			name: req.body.From,
			title: 'Inbound call',
			type: 'inbound_call',
			team: team.id,
			verified: true
		}

		twiml.enqueue({ workflowSid: req.configuration.twilio.workflowSid }, function (node) {
			node.task(JSON.stringify(attributes), {
				priority: 1,
				timeout: 3600
			})
		})

		//tasks.createTask(req, res, attributes)

        //optionActions[selectedOption](req, res, twiml)
		res.setHeader('Content-Type', 'application/xml')
		res.setHeader('Cache-Control', 'public, max-age=0')
		res.send(twiml.toString())
    }
    res.send(redirectInvalid(twiml))
}

var redirectInvalid = function (twiml) {
	twiml.say('Your selection was not valid, please try again')
	twiml.pause({length: 2})
	twiml.redirect({ method: 'POST' }, 'ivr')
}

var talkToAnAgent = function (req, res, twiml) {
	var team = req.configuration.ivr.options[0]
	/* create task attributes */
	var attributes = {
		text: 'Caller answered spam IVR with talk to an agent',
		channel: 'phone',
		phone: req.query.From,
		name: req.query.From,
		title: 'Inbound call',
		type: 'inbound_call',
		team: team.id,
		verified: 'true'
	}

	task.createTask(req, res, attributes)

	return twiml
}

var requestCallback = function (twiml) {
	return twiml
}
