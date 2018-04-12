var DBus, Promise, SERVICE, TECHNOLOGY_INTERFACE, WIFI_OBJECT, _, bus, config, dbus, fs, systemd, utils;

Promise = require('bluebird');

DBus = require('./dbus-promise');

fs = Promise.promisifyAll(require('fs'));

dbus = new DBus();

bus = dbus.getBus('system');

_ = require('lodash');

config = require('./config');

systemd = require('./systemd');

utils = require('./utils');

SERVICE = 'net.connman';

WIFI_OBJECT = '/net/connman/technology/wifi';

TECHNOLOGY_INTERFACE = 'net.connman.Technology';

exports.start = function() {
  return systemd.start('connman.service');
};

exports.stop = function() {
  return systemd.stop('connman.service');
};

exports.ready = function() {
  return systemd.waitUntilState('connman.service', 'active');
};

exports.isSetup = function() {
  return fs.statAsync(config.persistentConfig).then(function() {
    return utils.copyFile(config.persistentConfig, config.connmanConfig);
  })["return"](true).catchReturn(false);
};

exports.setCredentials = function(ssid, passphrase) {
  var connection;
  connection = "[service_home_ethernet]\nType = ethernet\nNameservers = 8.8.8.8,8.8.4.4\n\n[service_home_wifi]\nType = wifi\nName = " + ssid + "\nPassphrase = " + passphrase + "\nNameservers = 8.8.8.8,8.8.4.4\n";
  console.log('Saving connection');
  console.log(connection);
  return utils.durableWriteFile(config.persistentConfig, connection);
};

exports.clearCredentials = function() {
  return fs.unlinkAsync(config.persistentConfig)["catch"]({
    code: 'ENOENT'
  }, _.noop);
};

exports.connect = function(timeout) {
  return bus.getInterfaceAsync(SERVICE, WIFI_OBJECT, TECHNOLOGY_INTERFACE).then(function(manager) {
    return new Promise(function(resolve, reject) {
      var handler;
      handler = function(name, value) {
        if (name === 'Connected' && value === true) {
          manager.removeListener('PropertyChanged', handler);
          return resolve();
        }
      };
      manager.on('PropertyChanged', handler);
      manager.GetPropertiesAsync().then(function(arg) {
        var Connected;
        Connected = arg.Connected;
        if (Connected) {
          manager.removeListener('PropertyChanged', handler);
          return resolve();
        }
      });
      return setTimeout(function() {
        manager.removeListener('PropertyChanged', handler);
        return reject(new Error('Timed out'));
      }, timeout);
    });
  });
};

// ---
// generated by coffee-script 1.9.2
