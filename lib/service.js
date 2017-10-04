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

const path = require('path');
const async = require('async');
const archiver = require('archiver');
const chalk = require('chalk');
const config = require('config');
const KinveyError = require('./kinvey-error.js');
const logger = require('./logger.js');
const project = require('./project.js');
const user = require('./user.js');
const util = require('./util.js');
const JobStatus = require('./constants').JobStatus;
const ServiceStatus = require('./constants').ServiceStatus;
const Errors = require('./constants').Errors;

class Service {
  deploy(dir, version, cb) {
    logger.debug('Creating archive from %s', chalk.cyan(dir));
    const archive = archiver.create('tar');

    const attachment = {
      value: archive,
      options: {
        filename: 'archive.tar',
        contentType: 'application/tar'
      }
    };

    const req = util.makeRequest({
      method: 'POST',
      url: `/v${project.schemaVersion}/jobs`,
      headers: {
        'Transfer-Encoding': 'chunked'
      },
      formData: {
        type: 'deployDataLink',
        params: JSON.stringify({
          dataLinkId: project.service,
          version
        }),
        file: attachment
      },
      refresh: false,
      timeout: config.uploadTimeout || 30 * 1000
    }, (err, response) => {
      if (err != null) return req.emit('error', err);
      project.lastJobId = response.body.job;
      project.save();
      logger.info('Deploy initiated, received job %s', chalk.cyan(response.body.job));
      return cb();
    });

    req.on('pipe', () => req.removeHeader('Content-Length'));

    archive.on('data', () => {
      const size = archive.pointer();
      if (size > config.maxUploadSize) {
        logger.info('Max archive size exceeded (%s bytes, max %s bytes)', chalk.cyan(size), chalk.cyan(config.maxUploadSize));
        return req.emit('error', new KinveyError(Errors.ProjectMaxFileSizeExceeded));
      }
    });

    archive.on('finish', () => logger.debug('Created archive, %s bytes written', chalk.cyan(archive.pointer())));

    req.once('error', (err) => {
      logger.debug('Aborting the request because of error: %s', chalk.cyan(err.message || err));
      archive.removeAllListeners('finish');
      archive.abort();
      req.abort();
      if (err.name === 'InvalidCredentials') {
        return async.series([
          (next) => user.refresh(next),
          (next) => this.deploy(dir, version, next)
        ], cb);
      }
      return cb(err);
    });

    archive.bulk([
      {
        cwd: dir,
        src: '**/*',
        dest: false,
        dot: true,
        expand: true,
        filter: (filepath) => !this._isArtifact(dir, filepath)
      }
    ]);
    return archive.finalize();
  }

  logs(from, to, number, page, cb) {
    return this._execDatalinkLogs(from, to, number, page, (err, logs) => {
      if (err != null) return cb(err);
      const skippedLogEntries = [];
      logs.forEach((log) => {
        let messageString = log != null ? log.message : null;
        if (messageString == null) {
          log.skipped = true;
          return skippedLogEntries.push(log);
        }
        if (Object.prototype.toString.call(messageString !== '[object String]')) {
          messageString = JSON.stringify(messageString);
        }
        if (log.threshold != null) {
          return console.log('[%s] %s %s - %s', log.threshold, chalk.green(log.containerId.substring(0, 12)), log.timestamp, chalk.cyan(messageString.trim()));
        }
        return console.log('%s %s - %s', chalk.green(log.containerId.substring(0, 12)), log.timestamp, chalk.cyan(messageString.trim()));
      });
      if (skippedLogEntries.length > 0) {
        logger.debug('%s skipped log entries for FSR service %s (%s): %s', skippedLogEntries.length, project.service, project.serviceName, JSON.stringify(skippedLogEntries));
      }
      console.log('Query returned %s logs for FSR service %s (%s)', chalk.cyan(logs.length - skippedLogEntries.length), chalk.cyan(project.service), chalk.gray(project.serviceName));
      return cb(null, logs);
    });
  }

  recycle(cb) {
    return this._execRecycle((err, response) => {
      if (err != null) return cb(err);
      project.lastJobId = response.body.job;
      project.save();
      logger.info('Recycle initiated, received job %s', chalk.cyan(response.body.job));
      return cb();
    });
  }

  jobStatus(job, cb) {
    if (job == null) {
      job = project.lastJobId;
      if (job == null) return cb(new Error('No previous job stored. Please provide a job ID.'));
    }
    return this._execJobStatus(job, (err, response) => {
      if (err != null) return cb(err);
      const suffix = response.body.status !== JobStatus.COMPLETE && (response.body.progress != null) ? ` - ${response.body.progress}` : '';
      logger.info('Job status: %s%s', chalk.cyan(response.body.status), suffix);
      return cb(null, response.body.status);
    });
  }

  serviceStatus(cb) {
    return this._execServiceStatus((err, response) => {
      if (err != null) return cb(err);

      let status = response.body.status;
      let version = response.body.version;

      if (version != null) {
        version = chalk.whiteBright(`v${version}`);
      }

      if (status === ServiceStatus.ONLINE) {
        status = chalk.greenBright(ServiceStatus.ONLINE);
      } else if (status === ServiceStatus.UPDATING) {
        status = chalk.yellowBright(ServiceStatus.UPDATING);
      } else if (status === ServiceStatus.NEW) {
        status = chalk.cyanBright(ServiceStatus.NEW);
      } else if (status === ServiceStatus.ERROR) {
        status = chalk.redBright(ServiceStatus.ERROR);
      }

      console.log('Status of FSR service %s (%s)', chalk.cyan(project.service), chalk.gray(project.serviceName));
      process.stdout.write('\n');
      let displayVersionWarningFlag = false;

      // Print health + version if attached to response. Print health + warning if not
      if (response.body.version != null) {
        console.log('  Status:   %s [%s]', status, version);
      } else {
        console.log('  Status:   %s', status);
        if (response.body.status !== ServiceStatus.NEW) { // Special case, version can't exist for NEW services
          displayVersionWarningFlag = true;
        }
      }

      if (response.body.deployedAt != null && response.body.deployUserInfo != null) {
        process.stdout.write('\n');
        console.log(`  Deployed on:   ${new Date(response.body.deployedAt)}`);
        process.stdout.write(`  Deployed by:   ${response.body.deployUserInfo.email}`);

        if (response.body.deployUserInfo.firstName != null && response.body.deployUserInfo.lastName != null) {
          process.stdout.write(` (${response.body.deployUserInfo.firstName} ${response.body.deployUserInfo.lastName})`);
        }

        process.stdout.write('\n');
      }

      if (displayVersionWarningFlag === true) {
        logger.warn('\'kinvey status\' now displays service version in addition to service health.');
        logger.warn('Please initiate a one-time recycle to enable this feature. See the README or contact Kinvey support for more information.');
      }

      process.stdout.write('\n');

      return cb(null, { status: response.body.status, version: response.body.version, deployedAt: response.body.deployedAt, deployUserInfo: response.body.deployUserInfo });
    });
  }

  validate(dir, cb) {
    const packagePath = path.join(dir, 'package.json');
    return util.readJSON(packagePath, (err, json) => {
      if (json == null || json.dependencies == null || json.dependencies['kinvey-flex-sdk'] == null) {
        return cb(new KinveyError(Errors.InvalidProject));
      }
      if (!project.isConfigured()) {
        return cb(new KinveyError(Errors.ProjectNotConfigured));
      }
      return cb(err, json.version);
    });
  }

  _execDatalinkLogs(from, to, number, page, cb) {
    let paramAdded = false;
    let url = `/v${project.schemaVersion}/data-links/${project.service}/logs`;
    logger.debug(`Log start timestamp: ${from}`);
    logger.debug(`Logs end timestamp: ${to}`);
    if (from != null) {
      url += `?from=${from}`;
      paramAdded = true;
    }
    if (to != null) {
      if (paramAdded) {
        url += `&to=${to}`;
      } else {
        url += `?to=${to}`;
        paramAdded = true;
      }
    }
    if (number != null) {
      if (paramAdded) {
        url += `&limit=${number}`;
      } else {
        url += `?limit=${number}`;
        paramAdded = true;
      }
    }
    if (page != null) {
      if (paramAdded) {
        url += `&page=${page}`;
      } else {
        url += `?page=${page}`;
      }
    }
    return util.makeRequest({
      url
    }, (err, response) => cb(err, response != null ? response.body : null));
  }

  _execRecycle(cb) {
    return util.makeRequest({
      method: 'POST',
      url: `/v${project.schemaVersion}/jobs`,
      body: {
        type: 'recycleDataLink',
        params: {
          dataLinkId: project.service
        }
      }
    }, cb);
  }

  _execJobStatus(job, cb) {
    return util.makeRequest({
      url: `/v${project.schemaVersion}/jobs/${job}`
    }, cb);
  }

  _execServiceStatus(cb) {
    return util.makeRequest({
      url: `/v${project.schemaVersion}/data-links/${project.service}/status`
    }, cb);
  }

  _isArtifact(base, filepath) {
    const relative = path.normalize(path.relative(base, filepath));
    for (let i = 0; i < config.artifacts.length; i++) {
      const pattern = config.artifacts[i];
      if (relative.indexOf(pattern) === 0 || (`${relative}/`) === pattern) return true;
    }
    return false;
  }
}

module.exports = new Service();
