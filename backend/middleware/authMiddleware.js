const jwt =
require("jsonwebtoken");

module.exports =
(req, res, next) => {

    try {

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1] ? authHeader.split(' ')[1] : authHeader;

        if(!token){

            return res.status(401).json({

                message: "No token"
            });
        }

        const verified =
        jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = verified;

        next();

    } catch (error) {

        res.status(401).json({

            message: "Invalid token"
        });
    }
};