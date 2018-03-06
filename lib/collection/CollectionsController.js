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

const BaseController = require('../BaseController');
const CommandResult = require('../CommandResult');
const { ActiveItemType, AppOptionsName, CollectionOptionsName, EntityType, EnvOptionsName, Errors, OperationType } = require('../Constants');
const KinveyError = require('../KinveyError');
const { isNullOrUndefined } = require('../Utils');

class CollectionsController extends BaseController {
  constructor(options) {
    super(options);
    this.collectionsService = options.collectionsService;
    this.environmentsService = options.environmentsService;
  }

  preProcessOptions(options) {
    const appIsMissing = isNullOrUndefined(this.cliManager.getActiveItemId(ActiveItemType.APP))
      && isNullOrUndefined(options[AppOptionsName.APP]);
    if (appIsMissing) {
      throw new KinveyError(Errors.AppRequired);
    }

    const envIsMissing = isNullOrUndefined(this.cliManager.getActiveItemId(ActiveItemType.ENV))
      && isNullOrUndefined(options[EnvOptionsName.ENV]);
    if (envIsMissing) {
      throw new KinveyError(Errors.EnvRequired);
    }

    return true;
  }

  create(options, done) {
    async.waterfall([
      (next) => {
        this.environmentsService.getActiveOrSpecified(options, next);
      },
      (env, next) => {
        this.collectionsService.create({ name: options.name }, env.id, next);
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      }

      const identifier = result.name;
      const cmdResult = new CommandResult()
        .setRawData({ id: identifier })
        .setBasicMsg(OperationType.CREATE, EntityType.COLL, identifier);
      done(null, cmdResult);
    });
  }

  list(options, done) {
    async.waterfall([
      (next) => {
        this.environmentsService.getActiveOrSpecified(options, next);
      },
      (env, next) => {
        this.collectionsService.getAll(env.id, next);
      }
    ], (err, collections) => {
      if (err) {
        return done(err);
      }

      const result = [];
      collections.forEach((x) => {
        if (x.name !== '_blob') {
          result.push({
            name: x.name,
            type: isNullOrUndefined(x.dataLink) ? 'internal' : 'external'
          });
        }
      });

      const cmdResult = new CommandResult()
        .setTableData(result)
        .setRawData(collections);
      done(null, cmdResult);
    });
  }

  deleteCollection(options, done) {
    const identifier = options[CollectionOptionsName.COLL];

    async.waterfall([
      (next) => {
        this.environmentsService.getActiveOrSpecified(options, next);
      },
      (env, next) => {
        this.collectionsService.deleteById(env.id, identifier, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: identifier })
        .setBasicMsg(OperationType.DELETE, EntityType.COLL, identifier);
      done(null, cmdResult);
    });
  }
}

module.exports = CollectionsController;
