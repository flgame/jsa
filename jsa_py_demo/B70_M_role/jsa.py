# encoding utf-8

class JSAPack(object):
    def __init__(self, name = None, path = None, type = 1, info = None, items = None, data = None):
        self.name = name
        self.path = path
        self.type = type
        self.info = info
        self.items = items
        self.data = data
    def __repr__(self):
        return 'JSAPack name: %s, path: %s, type: %d' % (self.name, self.path, self.type)
        
class JSAData(object):
    def __init__(self, src = None, mask = None, offset = None, textureOffset = None, type = 3):
        self.type = type
        self.src = src
        self.mask = mask
        self.offset = offset
        self.textureOffset = textureOffset
    def __repr__(self):
        return 'JSAData src: %s, mask: %s, offset: %s, textureOffset: %s' % (self.src, self.mask, self.offset, self.textureOffset)
        
class JSAType(object):
    PACK = 1
    FOLDER = 2
    FILE = 3
    
class JSADataType(object):
    NORMAL_PNG = 1
    NORMAL_JPG = 2
    GRAY_SCALE_JPG = 3
    ALPHA_PNG = 4
    INVERSE_ALPHA_PNG = 5
    GRAY_SCALE_PNG = 6
    NORMAL_PNG8 = 7
    TEXTURE_PNG = 9
    TEXTURE_PNG8 = 10
    TEXTURE_JPG = 11