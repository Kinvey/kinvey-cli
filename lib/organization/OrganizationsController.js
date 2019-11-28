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
const { ActiveItemType, ConfigType, EntityType, Mapping, OperationType, OrgOptionsName } = require('../Constants');
const CommandResult = require('../CommandResult');
const { getItemError, isNullOrUndefined, mapFromSource, sortList } = require('../Utils');

class OrganizationsController extends BaseController {
  constructor(options) {
    super(options);
    this.organizationsService = options.organizationsService;
  }

  /**
   * Handles the 'push' command that applies a config file to an existing org.
   * @param options
   * @param done
   */
  update(options, done) {
    const operation = OperationType.UPDATE;
    const orgIdentifier = super.getActiveOrSpecifiedIdentifier(ActiveItemType.ORG, OrgOptionsName.ORG, options);
    const processOptions = {
      orgIdentifier,
      operation,
      file: options.file,
      configType: ConfigType.ORG
    };

    this.cliManager.processConfigFile(processOptions, (err, result) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: result.id })
        .setBasicMsg(operation, EntityType.ORG, result.id);
      done(null, cmdResult);
    });
  }

  /**
   * Handles the 'list' command to get and print all organizations.
   * @param options
   * @param done
   */
  list(options, done) {
    this.organizationsService.getAll((err, data) => {
      if (err) {
        return done(err);
      }

      const result = mapFromSource(Mapping[EntityType.ORG].BASIC, data);
      const cmdResult = new CommandResult()
        .setTableData(sortList(result))
        .setRawData(data);
      done(null, cmdResult);
    });
  }

  /**
   * Handles the 'show' command to get a specific/active org and print detailed info.
   * @param {Object} options
   * @param done
   * @returns {*}
   */
  show(options, done) {
    const activeOrg = this.cliManager.getActiveItem(ActiveItemType.ORG);
    const orgToShow = options[OrgOptionsName.ORG] || (activeOrg && activeOrg.id);
    if (isNullOrUndefined(orgToShow)) {
      return setImmediate(() => done(getItemError(EntityType.ORG)));
    }

    this.organizationsService.getByIdOrName(orgToShow, (err, data) => {
      if (err) {
        return done(err);
      }

      const result = mapFromSource(Mapping[EntityType.ORG].DETAILS, data);
      const cmdResult = new CommandResult()
        .setTableData(result)
        .setRawData(data);
      done(null, cmdResult);
    });
  }

  /**
   * Handles the 'use' command - sets the active org.
   * @param options
   * @param done
   */
  use(options, done) {
    const wantedOrg = options[OrgOptionsName.ORG];
    let orgToSet;

    async.series([
      (next) => {
        this.organizationsService.getByIdOrName(wantedOrg, (err, org) => {
          if (err) {
            return next(err);
          }

          orgToSet = org;
          next();
        });
      },
      (next) => {
        this.cliManager.setActiveItem(ActiveItemType.ORG, orgToSet, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: orgToSet.id })
        .setBasicMsg(OperationType.ACTIVATE, EntityType.ORG);
      done(null, cmdResult);
    });
  }

  exportOrg(options, done) {
    const activeOrg = this.cliManager.getActiveItem(ActiveItemType.ORG);
    const wantedOrg = options[OrgOptionsName.ORG] || (activeOrg && activeOrg.id);
    if (isNullOrUndefined(wantedOrg)) {
      return setImmediate(() => done(getItemError(EntityType.ORG)));
    }

    const exportOptions = { [OrgOptionsName.ORG]: wantedOrg, file: options.file };
    this.exporter.exportOrg(exportOptions, (err, data) => {
      if (err) {
        return done(err);
      }

      const cmdRes = new CommandResult()
        .setRawData(data)
        .setBasicMsg(OperationType.EXPORT, EntityType.ORG, wantedOrg);
      done(null, cmdRes);
    });
  }
}

module.exports = OrganizationsController;
