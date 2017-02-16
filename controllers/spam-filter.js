'use strict'

const twilio = require('twilio')

/* client for Twilio TaskRouter */
const taskrouterClient = new twilio.TaskRouterClient(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN,
	process.env.TWILIO_WORKSPACE_SID)

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
		method: 'GET',
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
	var team = req.configuration.ivr.options[0]
	var option = parseInt(req.query.Digits)

	var twiml = new twilio.TwimlResponse()

	/* the caller pressed a key that does not match an option */
	if (option !== 1 || option !== 2) {
	// redirect the call to the previous twiml
		twiml.say('Your selection was not valid, please try again')
		twiml.pause({length: 2})
		twiml.redirect({ method: 'GET' }, 'ivr')
	} else {
		/* create task attributes */
		var attributes = {
			text: 'Caller answered IVR with option "' + team.friendlyName + '"',
			channel: 'phone',
			phone: req.query.From,
			name: req.query.From,
			title: 'Inbound call',
			type: 'inbound_call',
			team: team.id,
			verified: 'true'
		}

		// update a task's attributes
		taskrouterClient.workspace.tasks(taskSid).update({
		    	attributes: JSON.stringify(attributes)
			}, function(err, task) {
		    	console.log(task.attributes);
				if (err) {
					console.log(err)
					twiml.say('An application error occured, the demo ends now')
				}
		});
	}

	twiml.say('you are a dirty spammer')
	twiml.hangup()
	res.setHeader('Content-Type', 'application/xml')
	res.setHeader('Cache-Control', 'public, max-age=0')
	res.send(twiml.toString())
}
