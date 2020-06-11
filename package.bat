@echo off
del /q /s package
rmdir package\
del simple-ffdb-%1.tar.gz

mkdir package
xcopy /E /I src package\src\
copy README.md package\README.md
copy package.json package\package.json
copy index.js package\index.js
7z a -ttar -so simple-ffdb-%1.tar package/ | 7z a -si simple-ffdb-%1.tar.gz

del /q /s package
rmdir package\src
rmdir package