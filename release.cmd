@echo off
set VER=1.2.5

sed -i -E "s/version>.+?</version>%VER%</" install.rdf
sed -i -E "s/version>.+?</version>%VER%</; s/download\/.+?\/html5-media-tuner-.+?\.xpi/download\/%VER%\/html5-media-tuner-%VER%\.xpi/" update.xml

set XPI=html5-media-tuner-%VER%.xpi
if exist %XPI% del %XPI%
zip -r9q %XPI% * -x .git/* .gitignore update.xml LICENSE README.md *.cmd *.xpi *.exe
