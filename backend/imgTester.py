from PIL import Image, ImageDraw, ImageColor
from PIL import ImagePalette
import random

COLORLIST = [
    "#000000",
    "#1D2B53",
    "#7E2553",
    "#008751",
    "#AB5236",
    "#5F574F",
    "#C2C3C7",
    "#FFF1E8",
    "#FF004D",
    "#FFA300",
    "#FFEC27",
    "#00E436",
    "#29ADFF",
    "#83769C",
    "#FF77A8",
    "#FFCCAA",
]

palette =  list(sum([ ImageColor.getcolor(col, "RGB") for col in COLORLIST ], ()))
palette += [255, 238, 217] ## Yellow grid color
palette += [241, 246, 255] ## Blue Grid Color
print(palette)

def quantize_img(img, pal):
    palIm = Image.new('P', (1,1))
    palIm.putpalette(palette)
    return(img.quantize(palette = palIm, dither=Image.Dither.NONE))
#imgpalette = ImagePalette.ImagePalette(mode="RGBA", palette=COLORLIST)

with Image.open("pls.png") as im:
    print(im.mode)
    im = quantize_img(im, palette)
    newim = im.convert('P')
    newim.putpalette(palette)
    newim.save("palletized.png", "PNG", optimize=1)#, bits=4)

