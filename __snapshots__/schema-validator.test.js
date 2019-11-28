exports['schema validator app with invalid app should fail 1'] = `

	settings.realtime: "realtime" must be an object
	settings.sessionTimeoutInSeconds: "sessionTimeoutInSeconds" must be a number
	environments.dev.schemaVersion: "schemaVersion" is required
	environments.dev.collections.colle0.type: "type" is required
`

exports['schema validator env with invalid env should fail 1'] = `

	schemaVersion: "schemaVersion" must be one of [1.0.0]
	settings.emailVerification.required: "required" must be a boolean
	collections.colle0.service: "service" is required
	collections.colle0.serviceEnvironment: "serviceEnvironment" is required
	collections.colle3.type: "type" is required
	commonCode.my-common-code: "value" must contain at least one of [code, codeFile]
	commonCode.ext-common-code: "value" contains a conflict between exclusive peers [code, codeFile]
	collectionHooks.colle2.onPreSaveD: "onPreSaveD" is not allowed
	collectionHooks.colle0.onPreSave.serviceEnvironment: "serviceEnvironment" is required
	collectionHooks.colle0.onPreFetch.serviceEnvironment: "serviceEnvironment" is required
	customEndpoints.end0.schedule.interval: "interval" must be one of [weekly, daily, hourly, 30-minutes, 10-minutes, 5-minutes, 1-minute]
	customEndpoints.end1.serviceEnvironment: "serviceEnvironment" is required
	customEndpoints.end1.schedule.start: "start" is required
	roles.Jedi.darkSide: "darkSide" is not allowed
	push.android.apiKey: "apiKey" is required
`

exports['schema validator org with invalid org should fail 1'] = `

	schemaVersion: "schemaVersion" is required
	settings.security.requireApprovals: "requireApprovals" must be a boolean
	settings.requireApprovals: "requireApprovals" is not allowed
	applications.TestApp.schemaVersion: "schemaVersion" is required
	applications.TestApp.environments.dev.collections.colle0.type: "type" is required
	applications.TestApp.services.TestExternalFlexService.environments.dev.host: "host" is required
	services.TestInternalFlexService.schemaVersion: "schemaVersion" is required
`

exports['schema validator service with invalid internal flex should fail 1'] = `

	environments.dev.host: "host" is not allowed
	environments.dev.runtime: "runtime" must be one of [node6, node8, node10, node12]
`

exports['schema validator service with invalid rapid data (sharepoint) should fail 1'] = `

	environments.default.host: "host" is required
	environments.default.authentication.type: "type" must be one of [ServiceAccount, ServiceAccountOAuth, MIC, WindowsServiceAccount, None, Basic, oauthClientCredentials]
`

exports['schema validator service with invalid rapid data (wrong type) should fail 1'] = `

	type: "type" must be one of [flex-internal, flex-external, data-rest, data-sharepoint, data-salesforce, data-mssql, data-progress, data-direct, data-health]
`
