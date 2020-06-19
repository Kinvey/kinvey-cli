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
const { AppOptionsName, CommonOptionsNames, EntityType, Errors, OperationType, OrgOptionsName, SitesOptionsNames } = require('../Constants');
const KinveyError = require('../KinveyError');
const { isEmpty, isNullOrUndefined, sortList, stripNullOrUndefined } = require('../Utils');

class SitesController extends BaseController {
  constructor(options) {
    super(options);
    this.sitesService = options.sitesService;
    this.siteEnvsService = options.siteEnvsService;
    this.applicationsService = options.applicationsService;
    this.organizationsService = options.organizationsService;
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

  _getAccessField(options, done) {
    this.organizationsService.getByIdOrName(options[OrgOptionsName.ORG], (err, org) => {
      if (err) {
        return done(err);
      }

      const access = {
        writers: { organizations: [org.id] },
        readers: { organizations: [org.id] }
      };
      done(null, access);
    });
  }

  _getFileLimits(site, done) {
    if (isEmpty(site.access) || isEmpty(site.access.writers)) {
      return done(new Error('Site is not associated with an app or org.'));
    }

    if (!isEmpty(site.access.writers.apps)) {
      const appId = site.access.writers.apps[0];
      this.applicationsService.getByIdOrName(appId, (err, app) => {
        if (err) {
          return done(err);
        }

        done(null, app.plan.sites.filesSizeInBytes);
      });
    } else {
      const orgId = site.access.writers.organizations[0];
      this.organizationsService.getByIdOrName(orgId, (err, org) => {
        if (err) {
          return done(err);
        }

        done(null, org.restrictions.sites.filesSizeInBytes);
      });
    }
  }

  create(options, done) {
    // validate siteEnv before creating a site
    const siteEnvOptions = stripNullOrUndefined({
      historyApiRouting: options[SitesOptionsNames.ROUTING],
      indexPage: options[SitesOptionsNames.INDEX_PAGE],
      errorPage: options[SitesOptionsNames.ERROR_PAGE]
    });

    if (siteEnvOptions.historyApiRouting && !isNullOrUndefined(siteEnvOptions.errorPage)) {
      return done(new Error('Cannot set errorPage when historyApiRouting is enabled.'));
    }

    async.waterfall([
      (next) => {
        this._getAccessField(options, next);
      },
      (access, next) => {
        const data = {
          access,
          name: options.name
        };

        this.sitesService.create(data, next);
      },
      (site, next) => {
        const siteEnv = {
          name: 'Default',
          options: siteEnvOptions
        };
        this.siteEnvsService.create(siteEnv, site.id, (err, data) => {
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
        isPublished: data.site.isPublished,
        publicUrl: data.site.publishingOptions.publicUrl,
        previewUrl: data.siteEnv.previewUrl,
        lastDeployedAt: data.siteEnv.lastDeployedAt,
        historyApiRouting: data.siteEnv.options.historyApiRouting,
        indexPage: data.siteEnv.options.indexPage,
        errorPage: data.siteEnv.options.errorPage
      };

      if (!isEmpty(data.site.access)) {
        if (data.site.access.writers.apps) {
          rawResult.app = data.site.access.writers.apps[0];
        } else if (data.site.access.writers.organizations) {
          rawResult.org = data.site.access.writers.organizations[0];
        }
      } else if (!isNullOrUndefined(data.site.organizationId)) {
        rawResult.org = data.site.organizationId;
      }

      const cmdResult = new CommandResult().setRawData(rawResult);
      done(null, cmdResult);
    });
  }

  deploy(options, done) {
    const siteIdentifier = options[SitesOptionsNames.SITE];
    let fileLimits;
    let siteId;
    let siteEnvId;
    let siteEnv;
    let site;

    async.series([
      (next) => {
        this._getSiteWithDefaultSiteEnv({ siteIdentifier }, (err, data) => {
          if (err) {
            return next(err);
          }

          ({ siteId, siteEnvId, siteEnv, site } = data);
          next();
        });
      },
      (next) => {
        this._getFileLimits(site, (err, limits) => {
          if (err || isEmpty(limits)) { // just move on and let the backend handle it
            fileLimits = {
              all: Infinity,
              single: Infinity
            };

            return next(null);
          }

          fileLimits = limits;
          next();
        });
      },
      (next) => {
        let indexPage;
        let errorPage;

        if (!options[SitesOptionsNames.FORCE]) {
          indexPage = siteEnv.options.indexPage;
          if (!siteEnv.options.historyApiRouting) {
            errorPage = siteEnv.options.errorPage;
          }
        }

        const deployOpts = {
          siteId,
          siteEnvId,
          indexPage,
          errorPage,
          targetPath: options.path,
          maxSizeSingleFile: fileLimits.single,
          maxSizeAllFiles: fileLimits.all
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

      if (!isNullOrUndefined(result.previewUrl)) {
        finalResult.previewUrl = result.previewUrl;
      }

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

  publish(options, done) {
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
        const publishOpts = {
          environmentId: siteEnvId,
          type: 'kinvey',
          domainName: options[SitesOptionsNames.DOMAIN_NAME]
        };
        this.sitesService.publish(siteId, publishOpts, next);
      }
    ], (err, results) => {
      if (err) {
        if (err.name === 'InvalidSiteEnvironment') {
          return done(new KinveyError('InvalidAction', 'No files have been deployed yet.'));
        }

        return done(err);
      }

      const result = results.pop();
      const rawData = {
        id: siteId,
        publicUrl: result.publicUrl
      };

      const userFriendlyMsg = `Publish initiated. Public URL: ${rawData.publicUrl}`;
      const cmdResult = new CommandResult()
        .setRawData(rawData)
        .setCustomMsg(userFriendlyMsg);
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
        this.sitesService.status(siteId, next);
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

  unpublish(options, done) {
    const siteIdentifier = options[SitesOptionsNames.SITE];
    let siteId;
    let siteEnvId;

    async.series([
      (next) => {
        this._getSiteWithDefaultSiteEnv({ siteIdentifier }, (err, data) => {
          if (err) {
            return next(err);
          }

          if (!data.site.isPublished) {
            return next(new KinveyError('InvalidOperation', 'Site is not published.'));
          }

          ({ siteId, siteEnvId } = data);

          next();
        });
      },
      (next) => {
        this.sitesService.unpublish(siteId, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const userFriendlyMsg = `Unpublish initiated. Site: ${siteId}`;
      const cmdResult = new CommandResult()
        .setRawData({ id: siteId })
        .setCustomMsg(userFriendlyMsg);
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
