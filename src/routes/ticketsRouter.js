const { Router } = require("express");
const { getAllTickets, getTicketById } = require("../controllers/tickets.controller");

const router = Router();

router.get("/", getAllTickets);
router.get("/:tid", getTicketById);

module.exports = router;
