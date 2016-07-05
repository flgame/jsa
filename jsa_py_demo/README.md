# jsa demo
java script animation

> 模型：武器, 人物
> 动作：atk_1, atk_2, atk_n, be_atk, dead, run, static<br/>
> 方向：45, 背侧, 背面, 正侧, 正面

#支持的打包格式
> NORMAL_PNG = 1<br/>
> NORMAL_JPG = 2<br/>
> GRAY_SCALE_JPG = 3<br/>
> ALPHA_PNG = 4<br/>
> INVERSE_ALPHA_PNG = 5<br/>
> GRAY_SCALE_PNG = 6<br/>
> NORMAL_PNG8 = 7<br/>
> TEXTURE_PNG = 9<br/>
> TEXTURE_PNG8 = 10<br/>
> TEXTURE_JPG = 11<br/>

更改默认格式，修改png2jsa.py中：<br/>
default_data_type = jsa.JSADataType.TEXTURE_PNG8<br/>


PS：示例中模型及素材请勿用于商业，仅供学习使用
