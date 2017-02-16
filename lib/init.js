

lodashMerge    = require 'lodash.merge'
updateNotifier = require 'update-notifier'
logger  = require './logger.coffee'
pkg     = require '../package.json'

module.exports = (command) ->
  # Merge options.
  options = lodashMerge { }, command.opts(), command.parent.opts()

  # Shared options.
  if options.silent?  then logger.config { level: 3 }
  if options.verbose? then logger.config { level: 0 }

  # Check for updates.
  unless options.suppressVersionCheck?
    logger.debug 'Checking for package updates'
    updateNotifier({ pkg: pkg, updateCheckInterval: 1000 * 60 * 30 }).notify { defer: false } # Show right away.

  # Return the options.
  options