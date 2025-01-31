const Booking = require('../models/booking.model'); // Adjust path as needed

exports.countFinalStatus = async function countFinalStatuses(providerId) {
    try {
        // Fetch all bookings from the database
        const bookings = await Booking.find({provider: providerId}, { status: 1 }); // Select only the status field

        // Initialize an object to store counts for each status
        const statusCounts = Booking.schema.path('status.status').enumValues.reduce((acc, status) => {
            acc[status] = 0; // Initialize each status with a count of 0
            return acc;
        }, {});

        // Loop through bookings and count the final statuses
        bookings.forEach((booking) => {
            const finalStatus = booking.status[booking.status.length - 1]?.status; // Get the last status
            if (finalStatus) {
                statusCounts[finalStatus] += 1;
            }
        });

        return statusCounts;
    } catch (error) {
        console.error("Error counting final statuses:", error);
        throw error;
    }
}
