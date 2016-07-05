@echo off
set path=%path%;C:\Python27
echo png2jsa Started
python png2jsa.py > log.txt
echo png2jsa finished, see log.txt for result
pause