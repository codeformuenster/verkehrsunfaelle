'use strict';

const Transform = require('stream').Transform,
  inherits = require('util').inherits,
  queue = require('async/queue'),
  worker = require('./geocodeworker'),
  DB = require('./db'),
  fs = require('fs');

const streamgeocoder = function (streamOptions) {
  if (!(this instanceof streamgeocoder)) {
    return new streamgeocoder(streamOptions);
  }

  if (!streamOptions) {
    streamOptions = {};
  }
  streamOptions.decodeStrings = false;
  streamOptions.objectMode = true;

  const failed = [];
  const startAt = Date.now();
  this.failed = failed;

  this.q = queue(worker, 25);

  this.q.drain = function () {
    console.log('queue end, writing failed to file');
    fs.writeFile(
      './failed.csv',
      failed.join('\n'),
      (err) => {
        console.log(err ? `Error :${err}` : 'ok');
        console.log('all items have been processed');
        console.log(`took ${Date.now() - startAt} ms`);
        DB.disconnect((disco_err) => {
          console.log(disco_err);
        });
      }
    );
  };


  Transform.call(this, streamOptions);
};

inherits(streamgeocoder, Transform);

streamgeocoder.prototype._transform = function _transform (data, encoding, callback) {
  this.q.push(data, this._onQueueFinish.bind({ failed: this.failed }));

  callback();
};

streamgeocoder.prototype._flush = function _flush (done) {
  done();
};

streamgeocoder.prototype._onQueueFinish = function _onQueueFinish (err, result) {
  if (err) {
    console.log('Task Error', err);

    return;
  }
  if (result && result !== '') {
    this.failed.push(result);
  }
};

module.exports = streamgeocoder;

