# References and stuff

## Read up

JPEG:

- https://en.wikipedia.org/wiki/JPEG

## Play around with

JS JPEG Library:

- https://github.com/gchudnov/inkjet

WebCrypto:

- [W3C WebCrypto API](https://w3c.github.io/webcrypto/)
- [MDN SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) - Every function is described with example.

---

## Goals

- Implement the scheme for RAW images with WebCrypto
- Implement scheme for JPEG images
- Integrate with 3rd part service

---

## Notes from Charles on the JPEG implementation

1. YUV color space.

    Normally we think about images in RGB color space -- red, green, and blue.  But JPEG uses a different representation, YUV, also sometimes called YCbCr.  The "Y" component is the luminance - think of it as a greyscale representation of the image.  U and V (or Cb and Cr) give the chrominance, the color.  This is similar to how old analog TV used to work.  It was simple enough to go from black-and-white TV to color TV by adding the Cb and Cr.

2. Chroma subsampling.

    Because the human eye is more sensitive to changes in luminance than chrominance, most JPEG encoders store U and V at half the resolution of Y.  So, take each 16x16 pixel block of the image, and scale down the U channel and the V channel to 8x8 each. Keep the Y at the original 16x16.  This is the first lossy step.  It gives a 50% reduction in size compared to the original bitmap.

3. Discrete cosine transform.

    This gives a frequency-domain representation of the image.  The DCT is applied on each 8x8 block, and returns a vector of 64 coefficients.

4. Quantization.

    This is the second lossy step.  Each DCT coefficient is rounded off to the nearest multiple of some quantization factor.  The human eye is more sensitive to changes in low-frequency (ie, spatially large) coefficients, so there's a different quantization level for each of the 64 coefficients.  Typically the high-frequency coefficients get rounded off most aggressively.  (This is what leads to blocky JPEG artifacts.)  We call the set of 64 the "quantization matrix".  To compress more aggressively, you simply increase the values in the quantization matrix.

    **NOTE**: If we do our encryption and decryption after this point, then we're not fighting against the lossy compression.  All data from here on out is preserved exactly by the JPEG coder.

5. Run length coding.

    After quantization, it's likely that many of the coefficients will be zero in each block.  So instead of writing out the full list of 64, we write each non-zero coefficient, followed by the number of zeroes.  (Or maybe it's the other way around -- you can check the spec to be sure, but it really doesn't matter for us.)

6. Entropy coding.

    In the final compression step, the JPEG coder does a Huffman code compression of the pairs (non-zero coeff, number of zeroes).
