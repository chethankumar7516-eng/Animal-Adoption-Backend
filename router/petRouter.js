import express from "express";

import {
    addPet,
    getAllPets,
    getPetById,
    updatePet,
    deletePet,
    GetByType,
    StatusUpdate,
    petlength
} from "../controller/petController.js";

import auth from "../middleware/auth.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// ==========================
// ADD PET - PROVIDER ONLY
// ==========================
router.post(
    "/add",
    auth,
    (req, res, next) => {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                success: false,
                message: "Only providers can add pets"
            });
        }

        next();
    },
    upload.single("image"),
    addPet
);

// ==========================
// GET ALL PETS - PUBLIC
// ==========================
router.get("/", getAllPets);

router.get("/petlength", petlength);
// ==========================
// GET PET BY ID - PUBLIC
// ==========================
router.get("/:id", getPetById);

// ==========================
// UPDATE PET - PROVIDER ONLY
// ==========================
router.put(
    "/update/:id",
    auth,
    (req, res, next) => {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                success: false,
                message: "Only providers can update pets"
            });
        }

        next();
    },upload.single("image"),
    updatePet
);

// ==========================
// DELETE PET - PROVIDER ONLY
router.delete(
  "/delete/:id", // <-- Added leading slash
  auth,
  (req, res, next) => {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can delete pets"
      });
    }

    next();
  },
  deletePet
);
router.get("getbytype/:type",GetByType)




router.put(
    "/statusupdate/:_id",
    StatusUpdate
);

export default router;