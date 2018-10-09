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

const { OperationType } = require('./Constants');
const { isNullOrUndefined } = require('./Utils');

class FileProcessorHelper {
  /**
   * Groups modifiedEntities per operation type: create, update, delete.
   * @param {Array} originalEntities A list of strings or a list of objects with a 'name' property or other property of choice.
   * @param {Object} modifiedEntities Keys on first level are the entity's name. Ex.: { "someName": {...}, "anyName": {...} }
   * @param {String} [prop] Property to group by. Defaults to 'name'.
   * @returns {Object}
   * @private
   */
  static groupEntitiesPerOperationType(originalEntities, modifiedEntities, prop = 'name') {
    const entitiesToDelete = [];
    const entitiesToCreate = {};
    const entitiesToUpdate = [];

    const entityNamesToModify = Object.keys(modifiedEntities);

    originalEntities.forEach((originalEntity) => {
      let originalName;
      if (originalEntity && isNullOrUndefined(originalEntity[prop])) {
        originalName = originalEntity;
      } else {
        originalName = originalEntity[prop];
      }

      if (!entityNamesToModify.includes(originalName)) {
        entitiesToDelete.push(originalName);
      } else {
        entitiesToUpdate.push({
          [originalName]: modifiedEntities[originalName]
        });
      }
    });

    entityNamesToModify.forEach((entityName) => {
      const entityAlreadyExists = originalEntities.find((x) => {
        if (!isNullOrUndefined(x[prop])) {
          return x[prop] === entityName;
        }

        return x === entityName;
      });

      if (!entityAlreadyExists) {
        entitiesToCreate[entityName] = modifiedEntities[entityName];
      }
    });

    return {
      [OperationType.CREATE]: entitiesToCreate,
      [OperationType.UPDATE]: entitiesToUpdate,
      [OperationType.DELETE]: entitiesToDelete
    };
  }
}

module.exports = FileProcessorHelper;
