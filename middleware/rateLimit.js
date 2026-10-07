import rateLimit from "express-rate-limit";

export const rateLimitation=rateLimit({
    windowMs:15*60*1000,
    limit:7,
    message:{
        message:"Too Many Request .... Try to login later"
    }
})