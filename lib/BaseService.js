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

const async = require('async');

const { Errors } = require('./Constants');
const KinveyError = require('./KinveyError');
const { isEmpty, isEnvID, isUUID } = require('./Utils');

class BaseService {
  constructor(cliManager) {
    this.cliManager = cliManager;
  }

  getAllEntities(endpoint, done) {
    this.cliManager.sendRequest({ endpoint }, done);
  }

  getEntityByName(endpoint, name, done) {
    this.getAllEntities(endpoint, (err, data) => {
      if (err) {
        return done(err);
      }

      const entities = data.filter(x => x.name === name);
      if (isEmpty(entities)) {
        return done(new KinveyError(Errors.NoEntityFound));
      }

      if (entities.length > 1) {
        return done(new KinveyError(Errors.TooManyEntitiesFound));
      }

      done(null, entities[0]);
    });
  }

  getEntityByIdOrName(identifier, endpointAll, endpointId, done) {
    const couldBeId = isUUID(identifier) || isEnvID(identifier);
    let entity;

    async.series([
      (next) => {
        // it looks like an id, so let's try that first
        if (couldBeId) {
          this.cliManager.sendRequest({ endpoint: endpointId }, (err, data) => {
            if (err) {
              if (err.name.includes('NotFound')) {
                return next(null);
              }

              return next(err);
            }

            entity = data;
            next();
          });
        } else {
          this.getEntityByName(endpointAll, identifier, (err, data) => {
            if (err) {
              return next(err);
            }

            entity = data;
            next();
          });
        }
      },
      (next) => {
        if (!isEmpty(entity)) {
          return setImmediate(next);
        }

        // handles the case where identifier looks like an id but is a name, actually - the name could be an UUID
        this.getEntityByName(endpointAll, identifier, (err, data) => {
          if (err) {
            return next(err);
          }

          entity = data;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, entity);
    });
  }
}

module.exports = BaseService;
