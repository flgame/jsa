@echo off
set path=%path%;C:\Python27
echo batch started
echo batch is running, please wait...
python batch_run.py > log.txt
echo batch finished, see log.txt and *.log for result
pause