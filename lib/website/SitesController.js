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
const { CommonOptionsNames, EntityType, Errors, OperationType, SitesOptionsNames } = require('../Constants');
const KinveyError = require('../KinveyError');
const { isEmpty, sortList } = require('../Utils');

class SitesController extends BaseController {
  constructor(options) {
    super(options);
    this.sitesService = options.sitesService;
    this.siteEnvsService = options.siteEnvsService;
  }

  _getDefaultSiteEnv({ siteId }, done) {
    this.siteEnvsService.getAll(siteId, (err, siteEnvs) => {
      if (err) {
        return done(err);
      }

      if (isEmpty(siteEnvs)) {
        return done(new KinveyError(Errors.NoSiteEnvFound));
      }

      if (siteEnvs.length > 1) {
        const names = siteEnvs.reduce((accumulator, x, index, arr) => {
          const separator = arr.length - 1 > index ? ', ' : '';
          return `${accumulator}${x.name}${separator}`;
        }, '');
        return done(new KinveyError('TooManySiteEnvs', `You have too many environments: ${names}`));
      }

      done(null, siteEnvs[0]);
    });
  }

  _getSiteWithDefaultSiteEnv({ siteIdentifier }, done) {
    this.sitesService.getByIdOrName(siteIdentifier, (err, site) => {
      if (err) {
        return done(err);
      }

      const siteId = site.id;
      this._getDefaultSiteEnv({ siteId }, (err, siteEnv) => {
        if (err) {
          return done(err);
        }

        const result = {
          siteId,
          siteEnvId: siteEnv.id,
          site,
          siteEnv
        };
        done(null, result);
      });
    });
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
      const sortedData = sortList(rawData);
      const cmdResult = new CommandResult().setRawData(sortedData);
      done(null, cmdResult);
    });
  }

  show(options, done) {
    const siteIdentifier = options[SitesOptionsNames.SITE];
    this._getSiteWithDefaultSiteEnv({ siteIdentifier }, (err, data) => {
      if (err) {
        return done(err);
      }

      const rawResult = {
        name: data.site.name,
        id: data.site.id,
        cdnUrl: data.siteEnv.cdnUrl,
        internalUrl: data.siteEnv.internalUrl
      };
      const cmdResult = new CommandResult().setRawData(rawResult);
      done(null, cmdResult);
    });
  }

  deploy(options, done) {
    const siteIdentifier = options[SitesOptionsNames.SITE];
    let siteId;
    let siteEnvId;

    async.series([
      (next) => {
        this._getSiteWithDefaultSiteEnv({ siteIdentifier }, (err, data) => {
          if (err) {
            return next(err);
          }

          ({ siteId, siteEnvId } = data);
          next();
        });
      },
      (next) => {
        const deployOpts = {
          siteId,
          siteEnvId,
          targetPath: options.path
        };
        this.siteEnvsService.deploy(deployOpts, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      const result = results.pop();
      // result could be partially successful - some files might be uploaded, but there may be errors at the same time
      const finalResult = {
        filesUploaded: result.filesUploaded
      };

      if (!isEmpty(result.siteEnvironment)) {
        finalResult.cdnUrl = result.siteEnvironment.cdnUrl;
        finalResult.internalUrl = result.siteEnvironment.internalUrl;
      }

      // TODO: cli-161 Consider moving this logic to Request.js when final API response is agreed upon
      if (!isEmpty(result.errors) && Array.isArray(result.errors)) {
        finalResult.errors = '';
        result.errors.forEach((errMsg) => {
          finalResult.errors += ` ${errMsg}`;
        });
      }

      if (finalResult.filesUploaded === 0) { // not even partial success, so it's better to return error
        return done(new KinveyError('DeployFailed', finalResult.errors));
      }

      const cmdResult = new CommandResult()
        .setRawData(finalResult);
      done(null, cmdResult);
    });
  }

  status(options, done) {
    const siteIdentifier = options[SitesOptionsNames.SITE];

    async.waterfall([
      (next) => {
        this._getSiteWithDefaultSiteEnv({ siteIdentifier }, next);
      },
      ({ siteId, siteEnvId }, next) => {
        this.siteEnvsService.status(siteId, siteEnvId, next);
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      }

      if (result.status) {
        result.status = result.status.toUpperCase();
      }

      const cmdResult = new CommandResult()
        .setRawData(result);
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
