import jwt from 'jsonwebtoken';
import handleError from '../error_logs/handleError.js'

function protectRoute(req, res, next) {
    const token = req.cookies.accessToken;
    if(!token)
        return handleError(res, 400, "Access token not found")
    
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if(err) {
            return handleError(res, 400, "Invalid token or expired")
        }

        // Check if token is nearing expiration (e.g., 5 minutes before expiry)
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const timeLeft = decoded.exp - currentTime; // Remaining time in seconds

        if (timeLeft < 1 * 60) { // Less than 5 minutes remaining
            const newAccessToken = jwt.sign(
                { userid: decoded.userid },
                process.env.SECRET_KEY,
                { expiresIn: "1m" } // Extend token validity
            );

            // Set new token as cookie
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                maxAge: 1 * 60 * 1000, // 1 minutes
            });
        }

        // Attach userid to request object for further use
        req.userid = decoded.userid
        next();
    })
}

export default protectRoute;