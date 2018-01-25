/**
 * Copyright (c) 2018, Kinvey, Inc. All rights reserved.
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

const { OperationMessage, OperationType } = require('./Constants');
const { isNullOrUndefined } = require('./Utils');

/**
 * Defines the result from the execution of a command.
 */
class CommandResult {
  /**
   * Creates CommandResult object.
   */
  constructor() {
    this.originalError = null;
    this._isSuccess = true;
    this.rawData = null;
    this.tableData = null;
    this.humanReadableFormat = {};
  }

  isSuccess() {
    return this._isSuccess;
  }

  getErrorResult() {
    if (this.isSuccess()) {
      return null;
    }

    return {
      success: this.isSuccess(),
      error: {
        name: this.originalError.name,
        message: this.originalError.message
      }
    };
  }

  setError(err) {
    if (isNullOrUndefined(err)) {
      return this;
    }

    this.originalError = err;
    this._isSuccess = false;
    return this;
  }

  getDataResult() {
    if (!this.isSuccess()) {
      return null;
    }

    const result = {
      success: this.isSuccess()
    };

    if (!isNullOrUndefined(this.rawData)) {
      result.data = this.rawData;
    }

    return result;
  }

  setRawData(data) {
    this.rawData = data;
    return this;
  }

  getTableData() {
    return this.tableData || this.rawData;
  }

  setTableData(data) {
    this.tableData = data;
    return this;
  }

  /**
   * Returns the userFriendlyMsg if already set or constructs one based on the operationType and entityType.
   * @returns {String}
   */
  getUserFriendlyMsg() {
    if (!isNullOrUndefined(this.humanReadableFormat.userFriendlyMsg)) {
      return this.humanReadableFormat.userFriendlyMsg;
    }

    // TODO: cli-28 Verify method behavior is as expected and remove the following code
    const skipId = this.humanReadableFormat.operationType === OperationType.SAVE || isNullOrUndefined(this.rawData) || isNullOrUndefined(this.rawData.id);
    if (skipId) {
      return  `${OperationMessage[this.humanReadableFormat.operationType]} ${this.humanReadableFormat.entityType}.`;
    }

    return `${OperationMessage[this.humanReadableFormat.operationType]} ${this.humanReadableFormat.entityType}: ${this.rawData.id}`;
  }

  /**
   * Sets a basic user-friendly message based on the operation type and entity.
   * @param {Constants.OperationType} operationType
   * @param {Constants.EntityType} entityType
   * @param [entityId]
   */
  setBasicMsg(operationType, entityType, entityId) {
    const id = entityId || this.rawData && this.rawData.id;
    const skipId = operationType === OperationType.SAVE || isNullOrUndefined(id);
    const msgLastPart = skipId ? `.` : `: ${id}`;
    this.humanReadableFormat.userFriendlyMsg = `${OperationMessage[operationType]} ${entityType}${msgLastPart}`;
    return this;
  }

  setCustomMsg(msg) {
    this.humanReadableFormat.userFriendlyMsg = msg;
    return this;
  }

  /**
   * Returns true if no tableData set or userFriendlyMsg available. Otherwise, false.
   * @returns {boolean}
   */
  humanReadableFormatIsTable() {
    const isTable = !isNullOrUndefined(this.tableData) || isNullOrUndefined(this.humanReadableFormat.userFriendlyMsg) && isNullOrUndefined(this.humanReadableFormat.operationType);
    return isTable;
  }
}

module.exports = CommandResult;
