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

const consoleTable = require('console.table');

const { EOL } = require('os');

const { OperationMessage, OperationType, OutputFormat } = require('./Constants');
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

  setError(err) {
    if (isNullOrUndefined(err)) {
      return this;
    }

    this.originalError = err;
    this._isSuccess = false;
    return this;
  }

  /**
   * Sets raw data that will be used for building formatted result as JSON or to construct a table.
   * @param data
   * @returns {CommandResult}
   */
  setRawData(data) {
    this.rawData = data;
    return this;
  }

  _getTableData() {
    return this.tableData || this.rawData;
  }

  /**
   * Set table data that will be used to build a table.
   * @param {Array|Object} data
   * @returns {CommandResult}
   */
  setTableData(data) {
    this.tableData = data;
    return this;
  }

  /**
   * Get human-readable result: either table or a basic string.
   * @returns {String}
   * @private
   */
  _getHumanReadableResult() {
    if (!this.isSuccess()) {
      return `${this.originalError.name}: ${this.originalError.message}`;
    }

    if (this._humanReadableFormatIsTable()) {
      const tableData = this._getTableData();
      const formattedTableData = consoleTable.getTable(tableData);
      return Array.isArray(tableData) ? `Count: ${tableData.length}${EOL}${EOL}${formattedTableData}` : formattedTableData;
    }

    return this._getUserFriendlyMsg();
  }

  /**
   * Get result in JSON format.
   * On success: { "success": true, "data": data }
   * On failure: { "success": false, "error": error }
   * @private
   */
  _getJSONResult() {
    const result = { success: this.isSuccess() };
    if (this.isSuccess()) {
      result.data = this.rawData;
    } else {
      result.error = {
        name: this.originalError.name,
        message: this.originalError.message
      };
    }

    const stringifiedResult = JSON.stringify(result, null, 2);
    return stringifiedResult;
  }

  /**
   * Get result in the chosen format.
   * @param {Constants.OutputFormat} format
   * @returns {*}
   */
  getFormattedResult(format) {
    let result;

    if (format === OutputFormat.JSON) {
      result = this._getJSONResult();
    } else {
      result = this._getHumanReadableResult();
    }

    return result;
  }

  /**
   * Returns the userFriendlyMsg if already set or constructs one based on the operationType and entityType.
   * @returns {String}
   */
  _getUserFriendlyMsg() {
    if (!isNullOrUndefined(this.humanReadableFormat.userFriendlyMsg)) {
      return this.humanReadableFormat.userFriendlyMsg;
    }

    const skipId = this.humanReadableFormat.operationType === OperationType.SAVE || isNullOrUndefined(this.rawData) || isNullOrUndefined(this.rawData.id);
    if (skipId) {
      return `${OperationMessage[this.humanReadableFormat.operationType]} ${this.humanReadableFormat.entityType}.`;
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
    const msgLastPart = skipId ? '.' : `: ${id}`;
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
  _humanReadableFormatIsTable() {
    const isTable = !isNullOrUndefined(this.tableData) || isNullOrUndefined(this.humanReadableFormat.userFriendlyMsg) && isNullOrUndefined(this.humanReadableFormat.operationType);
    return isTable;
  }
}

module.exports = CommandResult;
