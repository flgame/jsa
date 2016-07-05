# jsa
jsa pack tool

> 1. install ImageMagick and pngquant<br/>
> 2. change the path in png2jsa.py: (ImageMagick = "F:/programs/ImageMagick/") and (pngquant = "F:/programs/pngquant/")<br/>

#支持的打包格式
> 1. NORMAL_PNG = 1 //png原图，输出jsa文件<br/>
> 2. NORMAL_JPG = 2 //jpg原图，输出jsa文件<br/>
> 3. GRAY_SCALE_JPG = 3 //png转为jpg以及gray-scale-jpg透明数据的压缩格式，输出jsa文件<br/>
> 4. ALPHA_PNG = 4 //png转为jpg以及alpha-png透明数据的压缩格式，输出jsa文件<br/>
> 5. INVERSE_ALPHA_PNG = 5 //未定<br/>
> 6. GRAY_SCALE_PNG = 6 //png转为jpg以及gray-scale-png透明数据的压缩格式，输出jsa文件<br/>
> 7. NORMAL_PNG8 = 7 //png8压缩，输出jsa文件<br/>
> 8. TEXTURE_PNG = 9 //png原图，输出jsa.png序列图以及jsa.json配置<br/>
> 9. TEXTURE_PNG8 = 10 //png8压缩，输出jsa.png序列图以及jsa.json配置<br/>
>10. TEXTURE_JPG = 11 //jpg原图，输出jsa.jpg序列图以及jsa.json配置<br/>
