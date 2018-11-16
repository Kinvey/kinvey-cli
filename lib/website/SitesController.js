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
const { CommonOptionsNames, EntityType, OperationType, SitesOptionsNames } = require('../Constants');
const KinveyError = require('../KinveyError');
const { isNullOrUndefined, getItemError, mapFromSource, sortList } = require('../Utils');

class SitesController extends BaseController {
  constructor(options) {
    super(options);
    this.sitesService = options.sitesService;
    this.siteEnvsService = options.siteEnvsService;
  }

  create(options, done) {
    async.waterfall([
      (next) => {
        this.sitesService.create({ name: options.name }, next);
      },
      (site, next) => {
        this.siteEnvsService.create({ name: 'Default' }, site.id, (err, data) => {
          if (err) {
            return next(err);
          }

          next(null, site);
        });
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: result.id })
        .setBasicMsg(OperationType.CREATE, EntityType.SITE, result.id);
      done(null, cmdResult);
    });
  }

  list(options, done) {
    this.sitesService.getAll((err, data) => {
      if (err) {
        return done(err);
      }

      const rawData = data.map((x) => {
        return {
          id: x.id,
          name: x.name
        };
      });

      const cmdResult = new CommandResult()
        .setRawData(rawData)
        .setTableData(rawData);
      done(null, cmdResult);
    });
  }

  deleteSite(options, done) {
    const siteIdentifier = options[SitesOptionsNames.SITE];
    let id;

    async.series([
      (next) => {
        super.confirmDeleteOperation(options[CommonOptionsNames.NO_PROMPT], EntityType.SITE, siteIdentifier, next);
      },
      (next) => {
        this.sitesService.removeByIdOrName(siteIdentifier, (err, siteId) => {
          if (err) {
            return next(err);
          }

          id = siteId;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id })
        .setBasicMsg(OperationType.DELETE, EntityType.SITE);
      done(null, cmdResult);
    });
  }
}

module.exports = SitesController;
