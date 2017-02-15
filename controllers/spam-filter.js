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

	twiml.gather({
		action: 'create-task?teamId=' + team.id + '&teamFriendlyName=' + encodeURIComponent(team.friendlyName),
		method: 'GET',
		numDigits: 1,
		timeout: 5
	}, function (node) {
		node.say('Press any key if you want a callback, if you want to talk to an agent please wait on the line')
	})

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

module.exports.createTask = function (req, res) {
	/* create task attributes */
	var attributes = {
		text: 'Call routed through spam filter to "' + req.query.teamFriendlyName + '"',
		channel: 'phone',
		phone: req.query.From,
		name: req.query.From,
		title: 'Callback request',
		type: 'callback_request',
		team: req.query.teamId
	}

	taskrouterClient.workspace.tasks.create({
		WorkflowSid: req.configuration.twilio.workflowSid,
		attributes: JSON.stringify(attributes)
	}, function (err, task) {

		var twiml = new twilio.TwimlResponse()

		if (err) {
			console.log(err)
			twiml.say('An application error occured, the demo ends now')
		}  else {
			twiml.say('Thanks for your callback request, an agent will call you back a soon as possible')
			twiml.hangup()
		}

		res.setHeader('Content-Type', 'application/xml')
		res.setHeader('Cache-Control', 'public, max-age=0')
		res.send(twiml.toString())
	})

}