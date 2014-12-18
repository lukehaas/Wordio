http://www.puzzlers.org/pub/wordlists/ospd.txt

data

array of words

array of letters

score

level

achievements




PLAN
——————
word find actions
scoring
letter generation priorities?
design

sounds
points
levels
effects

make sure first row never creates a new word on slide-in

eaiou - 1
nrtls - 2
bcmp - 3
fhwy - 4
kjv - 5
qzx - 6







CORDOVA
——————————————
Steps so far
setup dir structure
install cordova globally : sudo npm install -g cordova

create the app(creates a dir called build): cordova create build com.build.wordio Wordio

all further cordova commands are run from build dir

add platforms such as android, iOS - these SDKs need to already be installed on machine

add prefs to config.xml

run: cordova build <platform>
————

Add plugins:
$ cordova plugin add org.apache.cordova.statusbar



