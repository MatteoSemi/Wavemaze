"""Build the original canvas bitmap glyphs into a local UI font."""
from pathlib import Path
import re
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
source=Path('src/render.ts').read_text().split('const glyphs:')[1].split('function text')[0]
glyphs=dict(re.findall(r"(?:'([^']+)'|\b([A-Z])):'([01]+)'",source)) if False else {}
for match in re.finditer(r"(?:'([^']+)'|\b([A-Z])):'([01]+)'",source):
    glyphs[match[1] or match[2]]=match[3]
order=['.notdef','space']+['g'+str(ord(c)) for c in glyphs]
fb=FontBuilder(1000,isTTF=True); fb.setupGlyphOrder(order)
cmap={32:'space'}
for c in glyphs:
    cmap[ord(c)]='g'+str(ord(c))
    if c.isalpha():cmap[ord(c.lower())]='g'+str(ord(c))
fb.setupCharacterMap(cmap)
out={}; metrics={}
for name in order:
    pen=TTGlyphPen(None)
    if name not in ['.notdef','space']:
        c=chr(int(name[1:]));bits=glyphs[c]
        for r in range(7):
            for x in range(5):
                if bits[r*5+x]=='1':
                    y=(6-r)*100
                    pen.moveTo((x*100,y));pen.lineTo((x*100,y+100));pen.lineTo((x*100+100,y+100));pen.lineTo((x*100+100,y));pen.closePath()
    out[name]=pen.glyph();metrics[name]=(600,0)
fb.setupGlyf(out);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=800,descent=-200)
fb.setupNameTable({'familyName':'Archive Pixel','styleName':'Regular','uniqueFontIdentifier':'ArchivePixel-1','fullName':'Archive Pixel','psName':'ArchivePixel-Regular','version':'Version 1.0'})
fb.setupOS2(sTypoAscender=800,sTypoDescender=-200,usWinAscent=800,usWinDescent=200);fb.setupPost();fb.setupMaxp()
fb.save('public/assets/archive-pixel.ttf')
