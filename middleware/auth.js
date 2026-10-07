import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required",
            });
        }

        // Get token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required",
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check role
        if (
            decoded.role !== "user" &&
            decoded.role !== "provider"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid user role",
            });
        }

        // Store decoded user information
        req.user = decoded;

        // Continue
        next();

    } catch (error) {
        console.error(
            "Auth error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default auth;