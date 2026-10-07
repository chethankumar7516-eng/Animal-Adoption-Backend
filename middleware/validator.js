import { body, validationResult } from "express-validator";

export const validateUserRegister = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email should be valid"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password should be a minimum of 6 characters"),

    body("phone")
        .optional()
        .trim(),

    body("address")
        .optional()
        .trim(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()
            });
        }

        next();
    }
];