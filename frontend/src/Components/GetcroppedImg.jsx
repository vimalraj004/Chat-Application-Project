import React from "react";
import { createCanvas, loadImage } from "canvas";

const GetcroppedImg = async (imagesrc, croppedAreaPixels) => {
  const image = await loadImage(imagesrc);
  const canvas = createCanvas(
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], "croppedImage.png", { type: "image/png" });

      resolve(file);
    });
  });
};

export default GetcroppedImg;
