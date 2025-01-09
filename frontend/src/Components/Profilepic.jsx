import { React, useState } from "react";
import { TextField, Button, Avatar, Dialog } from "@mui/material";
import Cropper from "react-easy-crop";
import style from "../CssFolder/Loginpage.module.css";
import GetcroppedImg from "./GetcroppedImg";
import { convertFileToImg } from "../common";

const Profilepic = ({ setCreateImage, setImage, image }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [opencrop, setOpenCrop] = useState(false);

  const [croppedArea, setCroppedArea] = useState(null);
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setOpenCrop(true);
    }
  };
  const handleCropComplete = async () => {
    const createimage = await GetcroppedImg(image, croppedArea);
    if (createimage instanceof File) {
      setCreateImage(createimage);

      const imgdata = await convertFileToImg(createimage);

      setImage(imgdata);
      setOpenCrop(false);
    } else {
      console.log("cropped img is not a file object");
    }
  };
  return (
    <div>
      <Button variant="contained" component="label">
        Upload profile pic
        <input type="file" hidden onChange={handleImageUpload} />
      </Button>
      {image && (
        <Avatar
          src={image}
          sx={{ width: "150px", height: "150px" }}
          alt="Profile Preview"
          onClick={() => {
            setOpenCrop(!opencrop);
          }}
        />
      )}
      <Dialog open={opencrop} onClose={() => setOpenCrop(false)}>
        <div style={{ position: "relative", width: "500px", height: "800px" }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(croppedArea, croppedAreaPixels) =>
              setCroppedArea(croppedAreaPixels)
            }
          />
        </div>
        <div className={style.editprofile}>
          <Button
            variant="contained"
            onClick={handleCropComplete}
            sx={{ width: "130px" }}
          >
            Crop
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenCrop(false)}
            sx={{ width: "130px" }}
          >
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default Profilepic;
