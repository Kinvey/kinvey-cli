exports['schema validator env with invalid env should fail 1'] = `

	schemaVersion: "schemaVersion" must be one of [1.0.0]
	settings.emailVerification.required: "required" must be a boolean
	collections.colle0.service: "service" is required
	collections.colle3.type: "type" is required
	commonCode.my-common-code: "value" must contain at least one of [code, codeFile]
	commonCode.ext-common-code: "value" contains a conflict between exclusive peers [code, codeFile]
	collectionHooks.colle2.onPreSaveD: "onPreSaveD" is not allowed
	scheduledCode.end0.interval: "interval" must be one of [weekly, daily, hourly, 30-minutes, 10-minutes, 5-minutes, 1-minute]
	scheduledCode.end2.start: "start" is required
	roles.Jedi.darkSide: "darkSide" is not allowed
	push.android.apiKey: "apiKey" is required
`

exports['schema validator service with invalid internal flex should fail 1'] = `

	host: "host" is not allowed
`
