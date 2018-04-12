var uuidSsid;

uuidSsid = 'BoomBeastic-' + process.env.RESIN_DEVICE_UUID.substring(0, 7);

module.exports = {
  ssid: process.env.PORTAL_SSID || uuidSsid,
  passphrase: process.env.PORTAL_PASSPHRASE,
  iface: process.env.PORTAL_INTERFACE || 'wlan0',
  gateway: process.env.PORTAL_GATEWAY || '192.168.42.1',
  dhcpRange: process.env.PORTAL_DHCP_RANGE || '192.168.42.2,192.168.42.254',
  connmanConfig: process.env.PORTAL_CONNMAN_CONFIG || '/host/var/lib/connman/network.config',
  persistentConfig: process.env.PORTAL_PERSISTENT_CONFIG || '/data/network.config',
  connectTimeout: process.env.CONNECT_TIMEOUT || 15000
};

// ---
// generated by coffee-script 1.9.2