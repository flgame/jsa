# jsa
jsa pack tool

> install ImageMagick and pngquant
> change the path in png2jsa.py: (ImageMagick = "F:/programs/ImageMagick/") and (pngquant = "F:/programs/pngquant/")

#支持的打包格式
> NORMAL_PNG = 1 //png原图，输出jsa文件
> NORMAL_JPG = 2 //jpg原图，输出jsa文件
> GRAY_SCALE_JPG = 3 //png转为jpg以及gray-scale-jpg透明数据的压缩格式，输出jsa文件
> ALPHA_PNG = 4 //png转为jpg以及alpha-png透明数据的压缩格式，输出jsa文件
> INVERSE_ALPHA_PNG = 5 //未定
> GRAY_SCALE_PNG = 6 //png转为jpg以及gray-scale-png透明数据的压缩格式，输出jsa文件
> NORMAL_PNG8 = 7 //png8压缩，输出jsa文件
> TEXTURE_PNG = 9 //png原图，输出jsa.png序列图以及jsa.json配置
> TEXTURE_PNG8 = 10 //png8压缩，输出jsa.png序列图以及jsa.json配置
> TEXTURE_JPG = 11 //jpg原图，输出jsa.jpg序列图以及jsa.json配置
