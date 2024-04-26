const router = require("express").Router();
const Booking = require("../models/bookingModel");
const Bus = require("../models/busModel");
const { v4: uuidv4 } = require('uuid');

// Simulate a payment and book seats on a bus
router.post("/book-seat", async (req, res) => {
    const { bus, seats, transactionId } = req.body;

    // Check for required fields
    if (!bus || !seats || seats.length === 0) {
        return res.status(400).json({
            message: "Missing required fields or no seats selected.",
            success: false,
        });
    }

    try {
        // Simulate a payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Find the bus to ensure it exists and to check seat availability
        const targetBus = await Bus.findById(bus);
        if (!targetBus) {
            return res.status(404).json({
                message: "Bus not found",
                success: false,
            });
        }

        // Check if any of the requested seats are already booked
        const isSeatAlreadyBooked = seats.some(seat => targetBus.seatsBooked.includes(seat));
        if (isSeatAlreadyBooked) {
            return res.status(400).json({
                message: "One or more seats are already booked.",
                success: false,
            });
        }

        // All checks pass, update the bus's booked seats
        targetBus.seatsBooked = [...targetBus.seatsBooked, ...seats];
        await targetBus.save();

        // Create and save the booking record
        const newBooking = new Booking({
            bus: bus,
            user: req.body.user, // Assuming user ID is passed from the front-end
            seats: seats,
            transactionId: transactionId || `FAKE-${uuidv4()}`, // Generate a fake ID if not provided
        });
        await newBooking.save();

        res.status(200).json({
            message: "Seats successfully booked!",
            booking: newBooking,
            success: true,
        });

    } catch (error) {
        console.error("Booking failed: ", error);
        res.status(500).json({
            message: "Booking failed due to server error.",
            error: error,
            success: false,
        });
    }
});

module.exports = router;
