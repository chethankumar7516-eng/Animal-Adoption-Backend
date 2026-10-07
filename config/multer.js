import multer from "multer"
import {v2 as cloudinary} from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"


cloudinary.config({
  cloud_name: "vfhlzi8w",
  api_key:"598426526453374" ,
  api_secret:"UPkssBCd01oL3kMWjND6W8m7pyE"
})

const storage = new CloudinaryStorage({
  cloudinary,
  params:{
    folder: "pets"
  }
})
 export  const upload = multer({storage})