'use strict'

const twilio  = require('twilio')
const async   = require('async')

/* client for Twilio TaskRouter */
const taskrouterClient = new twilio.TaskRouterClient(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN,
	process.env.TWILIO_WORKSPACE_SID)

/* client for Twilio Programmable Chat */
const chatClient = new twilio.IpMessagingClient(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN)

module.exports.createCallback = function (req, res) {

	taskrouterClient.workspace.tasks.create({
		WorkflowSid: req.configuration.twilio.workflowSid,
		attributes: JSON.stringify(req.body),
		timeout: 3600
	}, function (err) {
		if (err) {
			res.status(500).json(err)
		} else {
			res.status(200).end()
		}
	})

}

module.exports.createTask = function (req, res, attributes) {
	console.log('creating task')
	// update a task's attributes
	taskrouterClient.workspace.tasks.create(
		attributes,
		function(err, task) {
			console.log(task.attributes);
			if (err) {
				console.log(err)
			}
	});
}

module.exports.updateWorker = function (req, res, params) {
	console.log('updating worker')
	taskrouterClient.workspace.workers(req.body.WorkerSid).update(
		params,
		function(err, worker) {
			if (err) {
				console.log('worker error', err)
			}
	})
}

module.exports.updateTask = function (req, res, params) {
	console.log('updating task')
	taskrouterClient.workspace.tasks(req.body.taskSid).update(
		params,
		function(err, task) {
			if (task) { // updating task to 'complete' results in undefinted task
				if (err) {
					console.log( "task error", err)
				}
			}
		}
	)
}

module.exports.createChat = function (req, res) {
	/* create a chat room */
	async.waterfall([

		function (callback) {
			/* create token */
			var grant = new twilio.AccessToken.IpMessagingGrant({
				serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
				endpointId: req.body.endpoint
			})

			var accessToken = new twilio.AccessToken(
				process.env.TWILIO_ACCOUNT_SID,
				process.env.TWILIO_API_KEY_SID,
				process.env.TWILIO_API_KEY_SECRET,
				{ ttl: 3600 })

			accessToken.addGrant(grant)
			accessToken.identity = req.body.identity

			var payload = {
				identity: req.body.identity,
				token: accessToken.toJwt()
			}

			callback(null, payload)
		}, function (payload, callback) {
			/* retrieve chat service */
			var service = chatClient.services(process.env.TWILIO_CHAT_SERVICE_SID)
			var uid = Math.random().toString(36).substring(7)

			service.channels.create({
				friendlyName: 'Support Chat with ' + req.body.identity,
				uniqueName: 'support_channel_' + uid
			}, function (err, channel) {
				if (err) {
					callback(err)
				} else {
					payload.channelSid = channel.sid
					callback(null, payload)
				}
			})

		}, function (payload, callback) {

			taskrouterClient.workspace.tasks.create({
				workflowSid: req.configuration.twilio.workflowSid,
				attributes: JSON.stringify({
					title: 'Chat request',
					text: 'Customer entered chat via support page',
					channel: 'chat',
					endpoint: 'web',
					team: 'support',
					name: payload.identity,
					channelSid: payload.channelSid
				}), timeout: 3600
			}, function (err, task) {
				if (err) {
					callback(err)
				} else {
					payload.task = task.sid
					callback(null, payload)
				}
			})

		}
	], function (err, payload) {
		if (err) {
			console.log(err)
			res.status(500).json(err)

			return
		}

		res.status(200).send(payload)
	})
}

module.exports.createVideo = function (req, res) {

	async.waterfall([

		function (callback) {
			/* create token */
			var grant = new twilio.AccessToken.VideoGrant({
				configurationProfileSid: process.env.TWILIO_VIDEO_CONFIGURATION_SID
			})

			var accessToken = new twilio.AccessToken(
				process.env.TWILIO_ACCOUNT_SID,
				process.env.TWILIO_API_KEY_SID,
				process.env.TWILIO_API_KEY_SECRET,
				{ ttl: 3600 })

			accessToken.addGrant(grant)
			accessToken.identity = req.body.identity

			var uid = Math.random().toString(36).substring(7)

			var payload = {
				identity: req.body.identity,
				token: accessToken.toJwt(),
				room: uid
			}

			callback(null, payload)
		}, function (payload, callback) {

			taskrouterClient.workspace.tasks.create({
				workflowSid: req.configuration.twilio.workflowSid,
				attributes: JSON.stringify({
					title: 'Video request',
					text: 'Customer requested video support on web page',
					channel: 'video',
					name: payload.identity,
					room: payload.room
				}), timeout: 3600
			}, function (err, task) {
				if (err) {
					callback(err)
				} else {
					payload.task = task.sid
					callback(null, payload)
				}
			})

		}
	], function (err, payload) {
		if (err) {
			console.log(err)
			res.status(500).json(err)

			return
		}

		res.status(200).send(payload)
	})
}
