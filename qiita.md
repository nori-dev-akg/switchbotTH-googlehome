# はじめに
今年の冬は、例年以上に湿度に注意という事で、湿度が低いときはGoogleHomeに注意してもらうことにした。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/203949/94ee9ef4-78ce-4eee-548c-c6dd8e9bf31d.png)

# ハード
- RaspberryPi 3B
- GoogleHome (私のはminiです)
- SwitchBot 温湿度計
- 母艦(Windowsマシン。何でも良い)

# モジュール
主なモジュールは以下の通り。
- Raspberry Pi OS：Buster(2020-05-27-raspios-buster-armhf)
- Node.js
- castv2-client
- VoiceText
- node-switchbot
- Ambient(予め準備しておく：[Ambient](https://ambidata.io/refs/node-js/))

## Raspberry Pi OS
RaspberryPiのインストールは済んでいるもとします。

```bash
~ $ cat /proc/device-tree/model
Raspberry Pi 3 Model B Rev 1.2

~ $ lsb_release -a
No LSB modules are available.
Distributor ID: Raspbian
Description:    Raspbian GNU/Linux 10 (buster)
Release:        10
Codename:       buster
```

[Raspberry Pi OS：Buster(2020-05-27-raspios-buster-armhf)] (https://qiita.com/nori-dev-akg/items/38c2dfb108edb0d73908)

# castv2-googlehome
以前、投稿した「[RaspberryPi で castv2-client を使ってGoogleHomeをしゃべらす](https://qiita.com/nori-dev-akg/items/751e7d9bf2728afda28a)」を使用するので、しゃべるところまでは完成させておくこと。

# モジュールの取得
今回作成したモジュールをgithubに上げてあるので取得する。
https://github.com/nori-dev-akg/switchbotTH-googlehome

```bash
~ $ cd ~                                          #ホームに移動
~ $ git clone https://github.com/nori-dev-akg/switchbotTH-googlehome
~ $ cd switchbotTH-googlehome                     #カレントを移動しておく
~/switchbotTH-googlehome $ npm init --yes         #作業用ディレクトリ初期化
#以降、作業用ディレクトリで行う
```
# Ambient
せっかくなので Ambient でログも取っておく
Ambientライブラリをインストール

```bash
~/switchbotTH-googlehome $ npm install ambient-lib
```

# node-switchbot
Bluetooth用モジュールと node-switchbotライブラリをインストール

```bash
~/switchbotTH-googlehome $ sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
~/switchbotTH-googlehome $ npm install @abandonware/noble
~/switchbotTH-googlehome $ npm install node-switchbot
```
npm install時にwarningが出るけどスルー

## SwitchBot お試し
以下を実行すると、近くの SwitchBot のアドバタイズデータが取れます。何回か出ます。
"address" が SwitchBot の IPアドレス。

```bash
#sudoを付けること
~/switchbotTH-googlehome $ sudo node node-switchbot-sample.js
{
  "id": "xxxxxxxxxxxxxxxxx",
  "address": "xx:xx:xx:xx:xx:xx",
  "rssi": -87,
  "serviceData": {
    "model": "T",
    "modelName": "WoSensorTH",
    "temperature": {
      "c": 24.4,
      "f": 75.9
    },
    "fahrenheit": false,
    "humidity": 53,
    "battery": 100
  }
}
:
```

# 部屋が乾燥してきたらGoogleHomeで知らせてもらう
いよいよ本題。以下、ソース部分を任意に変更すること

- RaspberryPi のIPアドレス
- GoogleHome のIPアドレス
- VoiceText APIキー
- SwitchBot IPアドレス
- Ambient チャンネルID, ライトキー

ソースでは「20度以上で45%以下になったら通知」となっているので適宜。
メッセージも「乾燥しています」となっているので適宜。
※不在時対策：冬場不在時はエアコンを切っているので20度以上にはならないので

switchbotTH-googlehome.js

```js
         :
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
         :
```

## 実行してみる
```bash:
~/switchbotTH-googlehome $ sudo node switchbotTH-googlehome.js
24.3
44
ambient:200
乾燥しています
status broadcast playerState=IDLE content=http://192.168.0.31:8080/voicetext/voicetext.mp3
status broadcast playerState=PLAYING content=http://192.168.0.31:8080/voicetext/voicetext.mp3
```
上記のようになり、GoogleHomeから「乾燥しています」が聞こえればOK。

###動かないときは
- ```RaspberryPiのIPアドレス``` ```VoiceTextのAPIキー``` ```GoogleHomeのIPアドレス``` ```Ambient チャンネルID, ライトキー``` ```SwitchBot IP```をもう一度確認する。

- 特に ```RaspberryPiのIPアドレス``` と ```GoogleHomeのIPアドレス```が間違いやすい！！

- node-switchbot で使用している noble モジュールが **sudo** を必要とするので **sudo** を必ず付ける！```sudo node switchbotTH-googlehome.js```


#永続化 & 定期実行
RaspberryPiの再起動時にも実行されるようにする。
**crontab は sudo で実行する！**```sudo crontab -e```
**必ず、フルパスで記述する！**

```bash
#必ず sudo で実行すること！ 
~/switchbotTH-googlehome $ sudo crontab -e

#部屋が乾燥してきたらGoogleHomeで知らせてもらう
*/5 * * * * /usr/local/bin/node /home/pi/switchbotTH-googlehome/switchbotTH-googlehome.js > /home/pi/switchbotTH-googlehome/log 2>&1
```

```bash
#/etc/rc.local の下の方に追加
~/switchbotTH-googlehome $ sudo nano /etc/rc.local
```

/etc/rc.local

```bash
:
# castv2-googlehome
forever start /home/pi/castv2-googlehome/api.js

exit 0
```

以上。