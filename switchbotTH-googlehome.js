// Load the node-switchbot and get a `Switchbot` constructor object
const Switchbot = require('node-switchbot');
// Load the Ambient
const ambient = require('ambient-lib');
// Load the castv2-googlehome
const Castv2GoogleHome = require('../castv2-googlehome/castv2-googlehome.js');

const rapsberrypi_ip = '192.168.0.31';
const googlehome_ip = '192.168.0.200';
const voicetext_key = 'xxxxxxxxxxxxxxx';
const switchbot_ip = 'xx:xx:xx:xx:xx:xx';
const ambient_id = 9999; // Ambient チャンネルID
const ambient_key ='xxxxxxxxxxxxxx'; // Ambient ライトキー
const message = '乾燥しています';
const speaker = 'haruka'; //'show', 'haruka', 'hikari', 'takeru', 'santa', 'bear'
const min_temp = 20; // 20度以上
const min_humi = 45; // 45%以下

// Create an `Switchbot` object
const switchbot = new Switchbot();

// Create an `Castv2GoogleHome` object
const c2gh = new Castv2GoogleHome(rapsberrypi_ip, googlehome_ip, voicetext_key);

// connect Ambient
ambient.connect(ambient_id, ambient_key);

(async () => {
  // Start to monitor advertisement packets
  await switchbot.startScan({
    id: switchbot_ip,
  });
  // Set an event hander
  switchbot.onadvertisement = (ad) => {
    switchbot.stopScan();
    //console.log(JSON.stringify(ad, null, '  '));
    var temp = 0 + ad.serviceData.temperature.c;
    var humi = 0 + ad.serviceData.humidity;
    console.log(temp);
    console.log(humi);
    ambient.send({d1: temp, d2: humi}, function(err, res, body) {
      if (err) {
          console.error(err);
      }
      console.log("ambient:" + res.statusCode);
      if (temp >= min_temp && humi <= min_humi) {
        console.log(message);
        c2gh.speech(message, speaker);
      } else {
        console.log('湿度正常');
        process.exit();
      }
    });
  };
  // Wait 10 seconds
  await switchbot.wait(10000);
  // Stop to monitor
  switchbot.stopScan();
  process.exit();
})();
