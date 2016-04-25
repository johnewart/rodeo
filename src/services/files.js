'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  fs = require('fs'),
  path = require('path'),
  log = require('./log').asInternal(__filename);

/**
 * @param {string} filePath
 * @returns {object}
 */
function getJSONFileSafeSync(filePath) {
  let contents,
    result = null;

  try {
    contents = fs.readFileSync(filePath, {encoding: 'UTF8'});

    try {
      result = JSON.parse(contents);
    } catch (e) {
      log('warn', filePath, 'is not valid JSON', e);
    }
  } catch (ex) {
    // deliberately no warning, thus "safe".
  }

  return result;
}

/**
 * @param {string} filename
 * @returns {Promise}
 */
function readFile(filename) {
  const read = _.partialRight(bluebird.promisify(fs.readFile), 'utf8');

  return read(filename);
}

/**
 * @param {string} dirPath
 * @returns {Promise<[{path: string, filename: string, isDirectory: boolean}]>}
 */
function readDirectory(dirPath) {
  const read = bluebird.promisify(fs.readdir),
    lstat = bluebird.promisify(fs.lstat);

  return read(dirPath).map(function (filename) {
    const fullPath = path.join(dirPath, filename);

    return lstat(fullPath).then(function (fileStats) {
      return {
        path: fullPath,
        filename: filename,
        isDirectory: fileStats.isDirectory()
      };
    });
  });
}

module.exports.getJSONFileSafeSync = getJSONFileSafeSync;
module.exports.readFile = readFile;
module.exports.readDirectory = readDirectory;