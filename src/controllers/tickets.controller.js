const ticketModel = require("../data/mongo/models/ticketModel");

const getAllTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.find().populate('products.product');
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await ticketModel
            .findById(req.params.tid)
            .populate('products.product');

        if (!ticket) {
            return res.status(404).json({ success: false, error: "Ticket not found" });
        }

        res.status(200).json({ success: true, ticket });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAllTickets, getTicketById };
