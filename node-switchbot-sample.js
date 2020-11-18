// Load the node-switchbot and get a `Switchbot` constructor object
const Switchbot = require('node-switchbot');
// Create an `Switchbot` object
const switchbot = new Switchbot();
 
(async () => {
  // Start to monitor advertisement packets
  await switchbot.startScan();
  // Set an event hander
  switchbot.onadvertisement = (ad) => {
    console.log(JSON.stringify(ad, null, '  '));
    //console.log(ad.serviceData.temperature.c);
    //console.log(ad.serviceData.humidity);
  };
  // Wait 10 seconds
  await switchbot.wait(10000);
  // Stop to monitor
  switchbot.stopScan();
  process.exit();
})();
