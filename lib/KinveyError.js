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

/**
 * Creates a KinveyError.
 * @param {String|Object} nameOrObject The name of the error or an object containing name/NAME and message/MESSAGE.
 * @param {String} [message]
 * @constructor
 */
function KinveyError(nameOrObject, message) {
  if (nameOrObject == null) {
    nameOrObject = 'GeneralError';
  }

  let errorName;

  if (nameOrObject.NAME != null) {
    errorName = nameOrObject.NAME;
  } else if (nameOrObject.name != null) {
    errorName = nameOrObject.name;
  } else {
    errorName = nameOrObject;
  }

  this.name = errorName;
  this.message = message || (nameOrObject.message || nameOrObject.MESSAGE) || '';
  this.stack = (new Error()).stack;
}

KinveyError.prototype = Object.create(Error.prototype);
KinveyError.prototype.constructor = KinveyError;

module.exports = KinveyError;
