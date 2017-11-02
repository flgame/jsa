import sys
import traceback
reload(sys)
sys.setdefaultencoding("utf-8")
import imp, os, codecs, fnmatch, subprocess, shutil, distutils.file_util, distutils.dir_util

# the following two functions are from the py2exe wiki:
# http://www.py2exe.org/index.cgi/HowToDetermineIfRunningFromExe
def main_is_frozen():
    return (hasattr(sys, "frozen") or # new py2exe
            hasattr(sys, "importers") or # old py2exe
            imp.is_frozen("__main__")) # tools/freeze

# get main dir, for py2exe environment
def get_main_dir():
    tmp_dir = "."
    if main_is_frozen():
        tmp_dir = os.path.dirname(sys.executable)
    else:
        tmp_dir = os.path.dirname(__file__)
    return os.path.abspath(tmp_dir)

MAIN_DIR = get_main_dir()
DIR_NAME = os.path.split(MAIN_DIR)[1]
default_conf_dir = MAIN_DIR
default_log_file = os.path.join(MAIN_DIR, DIR_NAME + "_preprocess.log")
default_excludes = [".*", "tool", "tmp", "out", DIR_NAME + "_*"]
default_img_file = "*.png"
default_mask_file = "*.mask.png"

def isExclude(f):
    result = False
    for s in default_excludes:
        result = fnmatch.fnmatch(f, s)
        if(result):
            break
    return result
    
def processDirs(path, logF):
    files = [f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)) and fnmatch.fnmatch(f, default_img_file) and not fnmatch.fnmatch(f, default_mask_file)]
    prefixDir = ""
    for f in files:
        root = os.path.join(path, f)
        prefixDir = f[0:2]
        f = f[2:]
        out = os.path.join(path, prefixDir)
        if(not os.path.exists(out)):
            os.makedirs(out)
        shutil.move(root, os.path.join(out, f))
def start():
    try:
        logF = open(default_log_file, "w+")
        logF.write("start build: " + default_conf_dir + "\n")
        logF.flush()
        models = os.listdir(default_conf_dir)
        models = [f for f in models if os.path.isdir(os.path.join(default_conf_dir, f)) and not isExclude(f)]
        for m in models:
            root = os.path.join(default_conf_dir, m)
            logF.write("START::" + root + "\n")
            logF.flush()
            processDirs(root, logF)
            out = os.path.join(default_conf_dir, DIR_NAME + "_" + m)
            if(not os.path.exists(out)):
                os.makedirs(out)
            shutil.move(root, os.path.join(out, m))
        logF.write("end build")
        logF.flush()
        logF.close()
    except:
        type_, value_, traceback_ = sys.exc_info()
        print traceback.format_exception(type_, value_, traceback_)

if __name__ == '__main__':
    start()

