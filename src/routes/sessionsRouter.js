const express = require("express");
const sessionRouter = express.Router();

sessionRouter.get("/current", async(req,res)=>{
    res.send(req.session);
});

module.exports = sessionRouter;