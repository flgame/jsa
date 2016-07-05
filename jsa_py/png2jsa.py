# encoding utf-8
'''
Created on 2014-6-30

@author: risker
'''
import sys
import traceback
reload(sys)
sys.setdefaultencoding("utf-8")
import imp, os, codecs, fnmatch, subprocess, shutil, distutils.file_util, zlib, zipfile, math
import jsonpickle, json
import jsa

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

#####################################
#配置
DEBUG = True
#单行最大图片数
MAX_IMG_COLUMN = 8
#默认图片压缩格式
default_data_type = jsa.JSADataType.TEXTURE_PNG8
#工具路径配置
ImageMagick = "F:/programs/ImageMagick/"
pngquant = "F:/programs/pngquant/"
#####################################

default_png_file = "*.png"
default_jpg_file = "*.jpg"
default_info_file = "info.json"
default_img_out = os.path.normpath(os.path.join(MAIN_DIR, "out"))
default_log_file = os.path.join(MAIN_DIR, DIR_NAME + ".log")
default_out_img_png = os.path.join(MAIN_DIR, "jsa.png")
default_out_img_jpg = os.path.join(MAIN_DIR, "jsa.jpg")
default_out_file = os.path.join(MAIN_DIR, "jsa.json")
default_out_file_zip = os.path.join(default_img_out, "jsa.json.zip")
default_jsa_file = os.path.join(MAIN_DIR, DIR_NAME + "_" + str(default_data_type) + ".jsa")
default_excludes = ["out", ".*", "jsa.*"]
default_password = ""

#剪裁图片
img_mogrify_exe = ImageMagick + "mogrify.exe"
img_mogrify_opt = ['-trim']

#获取图片剪裁信息
img_identify_exe = ImageMagick + "identify.exe"
img_identify_opt = ['-format', '%X,%Y,%w,%h']

#提取图片透明度信息，生成mask图
img_mogrify_mask_exe = ImageMagick + "mogrify.exe"
#生成gray-scale-jpg的mask图
img_mogrify_mask_opt_3 = ['-alpha', 'extract', '-format']
img_mogrify_mask_img_3 = 'mask.jpg'
#生成alpha-png的mask图
img_mogrify_mask_opt_4 = ['-alpha', 'extract', '-alpha', 'on', '-format']
img_mogrify_mask_img_4 = 'mask.png'

#转换成jpg格式，去除alpha信息
img_mogrify_jpg_exe = ImageMagick + "mogrify.exe"
img_mogrify_jpg_opt = ['-format', 'jpg', '-background', 'black', '-alpha', 'remove', '-quality', '80%']

#将小图合成为大图
img_montage_exe = ImageMagick + "montage.exe"
img_montage_opt = ['-mode', 'Concatenate', '-background', 'none', '-tile']

#png压缩，转换为png8
img_png8_exe = pngquant + "pngquant.exe"
img_png8_opt = ['-f', '--speed', '1', '--ext', '.png']
img_pngout_exe = pngquant + "pngout.exe"
img_pngout_opt = ['-ks', '-f6']

def toUnicode(s, type = 'gbk'):
    return unicode(s, type)
    
def toAbs(s, type = 'gbk', root = None):
    if(None == root):
        root = default_img_out
    s = s[len(root):]
    s = os.path.normpath(s)
    s = s.replace("\\", "/");
    if (len(s) > 0 and s[0] == "/"):
        s = s[1:]
    return toUnicode(s, type)
    
def isExclude(f):
    result = False
    for s in default_excludes:
        result = fnmatch.fnmatch(f, s)
        if(result):
            break
    return result
def isTexture(t):
    if(t == jsa.JSADataType.TEXTURE_PNG or t == jsa.JSADataType.TEXTURE_PNG8 or t == jsa.JSADataType.TEXTURE_JPG):
        return True
    return False
    
def parseFile(f, jsaObj, logF, out, filesInfo):
    if(None == jsaObj):
        jsaObj = jsa.JSAPack()
    name = os.path.split(f)[1]
    base = os.path.splitext(name)[0]
    jsaObj.name = toUnicode(name)
    jsaObj.path = toAbs(os.path.join(out, name))
    jsaObj.type = jsa.JSAType.FILE
    data = jsa.JSAData()
    data.type = default_data_type
    jsaObj.data = data
    
    if(fnmatch.fnmatch(f, default_png_file)):
        tmpName = os.path.join(out, name)
        distutils.file_util.copy_file(f, tmpName)
        filesInfo["files"].append(tmpName)
        
        args = [img_mogrify_exe] + img_mogrify_opt + [tmpName]
        logF.write(" ".join(args) + "\n")
        logF.flush()
        p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=subprocess.PIPE)
        p.wait()
        logF.flush()
        
        args = [img_identify_exe] + img_identify_opt + [tmpName]
        logF.write(" ".join(args) + "\n")
        logF.flush()
        p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=subprocess.PIPE)
        p.wait()
        logF.flush()
        
        offsetInfo = p.stdout.readline().strip()
        logF.write(offsetInfo + "\n")
        offsetA = offsetInfo.split(",")[0:4]
        offsetA[0] = eval(offsetA[0])
        offsetA[1] = eval(offsetA[1])
        offsetA[2] = eval(offsetA[2])
        offsetA[3] = eval(offsetA[3])
        
        if(data.type == jsa.JSADataType.NORMAL_PNG or data.type == jsa.JSADataType.TEXTURE_PNG or data.type == jsa.JSADataType.TEXTURE_PNG8):
            #保持原版png格式，不压缩
            data.src = toUnicode(name)
        elif(data.type == jsa.JSADataType.NORMAL_PNG8):
            #png8压缩
            args = [img_png8_exe] + img_png8_opt + [tmpName]
            logF.write(" ".join(args) + "\n")
            logF.flush()
            p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=subprocess.PIPE)
            p.wait()
            logF.flush()
            
            args = [img_pngout_exe] + img_pngout_opt + [tmpName]
            logF.write(" ".join(args) + "\n")
            logF.flush()
            p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=subprocess.PIPE)
            p.wait()
            logF.flush()
            
            data.src = toUnicode(name)
        else:
            args = [img_mogrify_jpg_exe] + img_mogrify_jpg_opt + [tmpName]
            logF.write(" ".join(args) + "\n")
            logF.flush()
            p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=logF)
            p.wait()
            logF.flush()
            
            img_mogrify_mask_opt = img_mogrify_mask_opt_3
            img_mogrify_mask_img = img_mogrify_mask_img_3
            if(default_data_type == jsa.JSADataType.GRAY_SCALE_PNG):
                img_mogrify_mask_img = img_mogrify_mask_img_4
            if(default_data_type == jsa.JSADataType.ALPHA_PNG):
                img_mogrify_mask_opt = img_mogrify_mask_opt_4
                img_mogrify_mask_img = img_mogrify_mask_img_4
                
            args = [img_mogrify_mask_exe] + img_mogrify_mask_opt + [img_mogrify_mask_img, tmpName]
            logF.write(" ".join(args) + "\n")
            logF.flush()
            p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=logF)
            p.wait()
            logF.flush()
        
            os.remove(tmpName)
            tmpName = base + ".jpg"
            data.src = toUnicode(tmpName)
            tmpName = base + "." + img_mogrify_mask_img
            data.mask = toUnicode(tmpName)
        data.offset = offsetA
    elif(fnmatch.fnmatch(f, default_jpg_file)):
        tmpName = os.path.join(out, name)
        distutils.file_util.copy_file(f, tmpName)
        data.src = toUnicode(name)
        filesInfo["files"].append(tmpName)
    else:
        jsaObj = None
    
    return jsaObj
    
def parseDir(d, jsaObj, logF, out, filesInfo):
    if(None == jsaObj):
        jsaObj = jsa.JSAPack()
    name = os.path.split(d)[1]
    jsaObj.name = toUnicode(name)
    jsaObj.path = toAbs(out)
    jsaObj.type = jsa.JSAType.FOLDER
    items = []
    jsaObj.items = items
    files = os.listdir(d)
    for f in files:
        if(isExclude(f)):
            continue
        f_abs = os.path.join(d, f)
        if(os.path.isdir(f_abs)):
            d_abs = os.path.join(out, f);
            if(not os.path.exists(d_abs)):
                os.makedirs(d_abs)
            items.append(parseDir(f_abs, None, logF, d_abs, filesInfo))
        elif(f == default_info_file):
            fH = open(f_abs, "r")
            jsaObj.info = jsonpickle.decode(fH.read())
        else:
            tmpJsa = parseFile(f_abs, None, logF, out, filesInfo)
            if(tmpJsa):
                items.append(tmpJsa)
    return jsaObj
    
def packTexture(jsaObj, default_out_img, offInfo, files, logF):
    if(jsaObj.type == jsa.JSAType.FILE and jsaObj.data):
        offX = offInfo[0]
        offY = offInfo[1]
        maxH = offInfo[2]
        col = offInfo[3] + 1
        tileX = offInfo[4]
        tileY = offInfo[5]
        f = os.path.join(default_img_out, jsaObj.path.encode("gbk"))
        files.append(f)
        
        jsaObj.data.textureOffset = [offX, offY, jsaObj.data.offset[2], jsaObj.data.offset[3]]
        if(jsaObj.data.offset[3] > maxH):
            maxH = jsaObj.data.offset[3]
        if(col == tileX):
            offX = 0
            offY += maxH
            maxH = 0
            col = 0
        else:
            offX += jsaObj.data.offset[2]
        offInfo[0] = offX
        offInfo[1] = offY
        offInfo[2] = maxH
        offInfo[3] = col
    if(jsaObj.items):
        for item in jsaObj.items:
            packTexture(item, default_out_img, offInfo, files, logF)
        
def getBestTile(n):
    nX = 0
    nY = 0
    m = int(math.ceil(float(n) / MAX_IMG_COLUMN))
    if(m >= MAX_IMG_COLUMN):
        nX = MAX_IMG_COLUMN
        nY = m
        return [nX, nY]
    m = 0
    for i in range(MAX_IMG_COLUMN):
        i = i + 1
        for j in range(i):
            j = j + 1
            k = i * j
            if(k == n):
                m = k
                nX = i
                nY = j
                break
            if(k > n and (m == 0 or k < m)):
                m = k
                nX = i
                nY = j
        if(m == n):
            break
    return [nX, nY]
    
def start():
    try:
        if(os.path.exists(default_img_out)):
            shutil.rmtree(default_img_out, True)
        os.makedirs(default_img_out)
        
        logF = open(default_log_file, "w+")
        
        filesInfo = {}
        filesInfo["files"] = []
        jsaObj = parseDir(default_conf_dir, None, logF, default_img_out, filesInfo)
        if(None == jsaObj.info):
            jsaObj.info = {}
        jsaObj.info["type"] = default_data_type
        #合并成单张图片格式
        if(isTexture(default_data_type)):
            default_out_img = default_out_img_png
            if(default_data_type == jsa.JSADataType.TEXTURE_JPG):
                default_out_img = default_out_img_jpg
            if(os.path.exists(default_out_img)):
                os.remove(default_out_img)
            n = len(filesInfo["files"])
            jsaObj.info["num"] = n
            tiles = getBestTile(n)
            montageFiles = []
            packTexture(jsaObj, default_out_img, [0, 0, 0, 0] + tiles, montageFiles, logF)
            args = [img_montage_exe] + montageFiles + img_montage_opt + [str(tiles[0]) + "x" + str(tiles[1]), default_out_img]
            logF.write(" ".join(args) + "\n")
            logF.flush()
            p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=logF)
            p.wait()
            logF.flush()
            #png8压缩
            if(default_data_type == jsa.JSADataType.TEXTURE_PNG8):
                args = [img_png8_exe] + img_png8_opt + [default_out_img]
                logF.write(" ".join(args) + "\n")
                logF.flush()
                p = subprocess.Popen(args, cwd=MAIN_DIR, stderr=logF, stdout=subprocess.PIPE)
                p.wait()
                logF.flush()
            outF = open(default_out_file, "w")
            s = jsonpickle.encode(jsaObj)
            if(DEBUG):
                jsaObj = json.loads(s)
                s = json.dumps(jsaObj, indent=4)
            outF.write(s)
            outF.flush()
            outF.close()
        else:
            outF = open(default_out_file, "w")
            s = jsonpickle.encode(jsaObj)
            if(DEBUG):
                jsaObj = json.loads(s)
                s = json.dumps(jsaObj, indent=4)
            outF.write(s)
            outF.flush()
            outF.close()
            outF = open(default_out_file_zip, "wb")
            outF.write(zlib.compress(s))
            outF.flush()
            outF.close()
            
            logF.flush()
            logF.close()
            
            zf = zipfile.ZipFile(default_jsa_file, "w", zipfile.ZIP_STORED)
            if(default_password):
                zf.setpassword(default_password)
            for dirpath, dirnames, filenames in os.walk(default_img_out, True):
                fs = dirnames + filenames
                for f in fs:
                    f = os.path.join(dirpath, f)
                    af = toAbs(f)
                    zf.write(f, af)
            zf.close()
    except:
        type_, value_, traceback_ = sys.exc_info()
        print traceback.format_exception(type_, value_, traceback_)

if __name__ == '__main__':
    start()