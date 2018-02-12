/**
 * Copyright (c) 2017, Kinvey, Inc. All rights reserved.
 *
 * This software is licensed to you under the Kinvey terms of service located at
 * http://www.kinvey.com/terms-of-use. By downloading, accessing and/or using this
 * software, you hereby accept such terms of service  (and any agreement referenced
 * therein) and agree that you have read, understand and agree to be bound by such
 * terms of service and are of legal age to agree to such terms with Kinvey.
 *
 * This software contains valuable confidential and proprietary information of
 * KINVEY, INC and is subject to applicable licensing agreements.
 * Unauthorized reproduction, transmission or distribution of this file and its
 * contents is a violation of applicable laws.
 */

const winston = require('winston');

const { LogLevel, StderrLogLevels } = require('./Constants');

const levels = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.DATA]: 2,
  [LogLevel.INFO]: 3,
  [LogLevel.DEBUG]: 4
};

let logger = {};

const formatter = (options) => {
  const printMsgOnly = options.level === LogLevel.INFO || options.level === LogLevel.DATA;
  if (printMsgOnly) {
    return `${options.message}`;
  }

  const levelPart = logger.stripColors ? `[${options.level}]` : `[${winston.config.colorize(options.level)}]`;

  if (options.level === LogLevel.ERROR) {
    // if we have an error object it is retrieved from meta
    const errMsg = options.message ? options.message : `${options.meta.name}: ${options.meta.message}`;
    const finalErrMsg = `${levelPart} ${errMsg}`;
    return finalErrMsg;
  }

  return `${levelPart} ${options.message}`;
};

logger = new (winston.Logger)({
  levels,
  level: LogLevel.INFO,
  stripColors: false,
  transports: [
    new (winston.transports.Console)({
      formatter,
      stderrLevels: StderrLogLevels
    })
  ]
});

module.exports = logger;
