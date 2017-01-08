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

  const failedStream = fs.createWriteStream(`${__dirname}/failed.csv`, { flags: 'w' });;
  this.failedStream = failedStream;
  const startAt = Date.now();

  this.q = queue(worker, 25);

  this.q.drain = function () {
    console.log('queue end');
    console.log(`took ${Date.now() - startAt} ms`);
    DB.disconnect((err) => {
      console.log(err ? `Error disconnecting db :${err}` : 'disconnected from db');
      failedStream.end();
    });
  };


  Transform.call(this, streamOptions);
};

inherits(streamgeocoder, Transform);

streamgeocoder.prototype._transform = function _transform (data, encoding, callback) {
  this.q.push(data, this._onQueueFinish.bind({ failedStream: this.failedStream }));

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
    this.failedStream.write(`${result}\n`);
  }
};

module.exports = streamgeocoder;

