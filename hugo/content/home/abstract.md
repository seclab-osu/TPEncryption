---
title: "Abstract"
weight: 1
# image: "privacy.png"
---
<p align="justify">
In this paper we motivate the need for image encryption techniques which preserve certain visual features of images (and hide all other information), to provide a balance between privacy and usability in the context of cloud-based image storage services. In particular, we introduce the concept of ideal or exact Thumbnail-Preserving Encryption (TPE), a special case of format-preserving encryption, and present a concrete construction. In TPE, a ciphertext is itself an image that has the same thumbnail as the plaintext (unencrypted) image, but that provably leaks nothing about the plaintext beyond its thumbnail. We provide a formal security analysis for the construction, and a prototype implementation to demonstrate compatibility with existing services. We also study the ability of users to distinguish between thumbnail images preserved by TPE. Our findings indicate that TPE is a realistic and promising way to balance usability and privacy concerns for images.
</p>
