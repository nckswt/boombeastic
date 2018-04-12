var DBus, MANAGER_INTERFACE, MANAGER_OBJECT, Promise, SERVICE, UNIT_INTERFACE, _, bus, dbus, getState, repeat, waitUntilState;

Promise = require('bluebird');

DBus = require('./dbus-promise');

dbus = new DBus();

bus = dbus.getBus('system');

_ = require('lodash');

SERVICE = 'org.freedesktop.systemd1';

MANAGER_OBJECT = '/org/freedesktop/systemd1';

MANAGER_INTERFACE = 'org.freedesktop.systemd1.Manager';

UNIT_INTERFACE = 'org.freedesktop.systemd1.Unit';

exports.start = function(unit, mode) {
  if (mode == null) {
    mode = 'fail';
  }
  console.log('Starting ' + unit);
  return bus.getInterfaceAsync(SERVICE, MANAGER_OBJECT, MANAGER_INTERFACE).then(function(manager) {
    return manager.StartUnitAsync(unit, mode);
  }).then(function() {
    return waitUntilState(unit, 'active');
  });
};

exports.stop = function(unit, mode) {
  if (mode == null) {
    mode = 'fail';
  }
  console.log('Stopping ' + unit);
  return bus.getInterfaceAsync(SERVICE, MANAGER_OBJECT, MANAGER_INTERFACE).then(function(manager) {
    return manager.StopUnitAsync(unit, mode);
  }).then(function() {
    return waitUntilState(unit, 'inactive');
  });
};

exports.exists = function(unit, mode) {
  if (mode == null) {
    mode = 'fail';
  }
  return bus.getInterfaceAsync(SERVICE, MANAGER_OBJECT, MANAGER_INTERFACE).call('ListUnitsAsync').then(function(units) {
    return _.has(units[0], unit);
  });
};

exports.waitUntilState = waitUntilState = function(unit, targetState) {
  var action, condition, currentState;
  currentState = null;
  condition = function() {
    return currentState !== targetState;
  };
  action = function() {
    return getState(unit).then(function(state) {
      return currentState = state;
    }).delay(1000);
  };
  return repeat(condition, action);
};

getState = function(unit) {
  return bus.getInterfaceAsync(SERVICE, MANAGER_OBJECT, MANAGER_INTERFACE).then(function(manager) {
    return manager.GetUnitAsync(unit);
  }).then(function(objectPath) {
    return bus.getInterfaceAsync(SERVICE, objectPath, UNIT_INTERFACE);
  }).then(function(unit) {
    return unit.getPropertyAsync('ActiveState');
  });
};

repeat = function(condition, action) {
  return Promise["try"](condition).then(function(bool) {
    if (!bool) {
      return;
    }
    return Promise["try"](action).then(function() {
      return repeat(condition, action);
    });
  });
};

// ---
// generated by coffee-script 1.9.2
