// From https://technote.fyi/code/javascript/base32-encoding-and-decoding-in-javascript/
(function(exports) {
    var base32 = {
        a: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
        pad: "=",
        encode: function (s) {
            var a = this.a;
            var pad = this.pad;
            var len = s.length;
            var o = "";
            var w, c, r=0, sh=0;
            for(i=0; i<len; i+=5) {
                // mask top 5 bits
                c = s.charCodeAt(i);
                w = 0xf8 & c;
                o += a.charAt(w>>3);
                r = 0x07 & c;
                sh = 2;

                if ((i+1)<len) {
                    c = s.charCodeAt(i+1);
                    // mask top 2 bits
                    w = 0xc0 & c;
                    o += a.charAt((r<<2) + (w>>6));
                    o += a.charAt( (0x3e & c) >> 1 );
                    r = c & 0x01;
                    sh = 4;
                }

                if ((i+2)<len) {
                    c = s.charCodeAt(i+2);
                    // mask top 4 bits
                    w = 0xf0 & c;
                    o += a.charAt((r<<4) + (w>>4));
                    r = 0x0f & c;
                    sh = 1;
                }

                if ((i+3)<len) {
                    c = s.charCodeAt(i+3);
                    // mask top 1 bit
                    w = 0x80 & c;
                    o += a.charAt((r<<1) + (w>>7));
                    o += a.charAt((0x7c & c) >> 2);
                    r = 0x03 & c;
                    sh = 3;
                }

                if ((i+4)<len) {
                    c = s.charCodeAt(i+4);
                    // mask top 3 bits
                    w = 0xe0 & c;
                    o += a.charAt((r<<3) + (w>>5));
                    o += a.charAt(0x1f & c);
                    r = 0;
                    sh = 0;
                } 
            }
            // Calculate length of pad by getting the 
            // number of words to reach an 8th octet.
            if (r!=0) { o += a.charAt(r<<sh); }
            var padlen = 8 - (o.length % 8);
            // modulus 
            if (padlen==8) { return o; }
            if (padlen==1) { return o + pad; }
            if (padlen==3) { return o + pad + pad + pad; }
            if (padlen==4) { return o + pad + pad + pad + pad; }
            if (padlen==6) { return o + pad + pad + pad + pad + pad + pad; }
            console.log('there was some kind of error');
            console.log('padlen:'+padlen+' ,r:'+r+' ,sh:'+sh+', w:'+w);
        },
        decode: function(s) {
            var len = s.length;
            var apad = this.a + this.pad;
            var v,x,r=0,bits=0,c,o='';

            s = s.toUpperCase();

            for(i=0;i<len;i+=1) {
                v = apad.indexOf(s.charAt(i));
                if (v>=0 && v<32) {
                    x = (x << 5) | v;
                    bits += 5;
                    if (bits >= 8) {
                        c = (x >> (bits - 8)) & 0xff;
                        o = o + String.fromCharCode(c);
                        bits -= 8;
                    }
                }
            }
            // remaining bits are < 8
            if (bits>0) {
                c = ((x << (8 - bits)) & 0xff) >> (8 - bits);
                // Don't append a null terminator.
                // See the comment at the top about why this sucks.
                if (c!==0) {
                    o = o + String.fromCharCode(c);
                }
            }
            return o;
        }
    };

    var base32hex = {
        a: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
        pad: '=',
        encode: base32.encode,
        decode: base32.decode
    };
    exports.base32 = base32;
    exports.base32hex = base32hex;
})(this.Conversions = {});