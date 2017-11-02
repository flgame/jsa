@echo off
set path=%path%;C:\Python27
echo preprocess started
echo preprocess is running, please wait...
python preprocess.py > log.txt
echo preprocess finished, see log.txt and *.log for result