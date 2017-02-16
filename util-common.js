module.exports.generateSessionExirationDate = function (seconds) {
	// TODO, throw exception is parameter is not set
	var now = new Date()
	var sideOfGmt = now.getTimezoneOffset() > 0 ? 1 : -1;
	//var offset = (now.getTimezoneOffset() * 60 * 1000) * -1
	var offset = (now.getTimezoneOffset() * 60 * 1000) * sideOfGmt
	var date = new Date(now.getTime() + offset + (seconds * 1000))

	return date
}

module.exports.convertToString = function (err) {
	return JSON.stringify(err, Object.getOwnPropertyNames(err))
}
