/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.6
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */

/*jslint bitwise: true */
'use strict';

var sha256 = function sha256(message) {
    if (message === undefined || message === null) {
        throw new Error('Message must be defined');
    }

    var HEX_CHARS = '0123456789abcdef'.split('');
    var EXTRA = [-2147483648, 8388608, 32768, 128];
    var SHIFT = [24, 16, 8, 0];
    var K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    var blocks = [];

    var isString = typeof message === 'string';
    if (isString) {
        message = unescape(encodeURIComponent(message)); // UTF8 encode
    }

    var buffer = message;
    var i, j, start, bytes = 0, length = message.length;
    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    var block = 0;

    for (i = 0; i < length; ++i) {
        start = i;
        if (isString) {
            block = (block << 8) | message.charCodeAt(i);
        } else {
            block = (block << 8) | message[i];
        }
        bytes++;

        if (bytes % 4 === 0) {
            blocks[Math.floor((bytes - 1) / 4)] = block;
            block = 0;
        }
    }

    blocks[Math.floor((bytes - 1) / 4)] = block << SHIFT[bytes % 4];

    var hashed = false;
    var lastByteIndex = bytes;

    // finalize
    var highBit = bytes * 8;
    var lowBit = 0;

    blocks[lastByteIndex >> 2] |= EXTRA[lastByteIndex & 3];
    blocks[(((lastByteIndex + 8) >> 6) << 4) + 15] = highBit;

    for (i = 0; i < blocks.length; i += 16) {
        var w = K.slice(0, 64);
        for (j = 0; j < 16; ++j) {
            w[j] = blocks[i + j];
        }
        for (j = 16; j < 64; ++j) {
            var s0 = ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^ ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^ (w[j - 15] >>> 3);
            var s1 = ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^ ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^ (w[j - 2] >>> 10);
            w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
        }

        var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

        for (j = 0; j < 64; ++j) {
            var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
            var ch = (e & f) ^ ((~e) & g);
            var temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
            var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
            var maj = (a & b) ^ (a & c) ^ (b & c);
            var temp2 = (S0 + maj) | 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }

        h0 = (h0 + a) | 0;
        h1 = (h1 + b) | 0;
        h2 = (h2 + c) | 0;
        h3 = (h3 + d) | 0;
        h4 = (h4 + e) | 0;
        h5 = (h5 + f) | 0;
        h6 = (h6 + g) | 0;
        h7 = (h7 + h) | 0;
    }

    var hex = "";
    var hNames = [h0, h1, h2, h3, h4, h5, h6, h7];
    for (i = 0; i < 8; ++i) {
        var val = hNames[i];
        for (j = 0; j < 4; ++j) {
            hex += HEX_CHARS[(val >> (8 * (3 - j) + 4)) & 0x0F] + HEX_CHARS[(val >> (8 * (3 - j))) & 0x0F];
        }
    }
    return hex;
};

module.exports = {
    sha256: sha256
};
