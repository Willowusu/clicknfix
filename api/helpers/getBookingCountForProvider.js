const Booking = require('../models/booking.model'); // Adjust path as needed
const Serviceman = require('../models/serviceman.model'); // Adjust path as needed

exports.getBookingCountForProvider = async (providerId) => {
    try {
        // Step 1: Find all servicemen tied to the provider
        const servicemen = await Serviceman.find({ provider: providerId }).select('_id');

        // Extract the servicemen IDs
        const servicemenIds = servicemen.map(s => s._id);

        if (servicemenIds.length === 0) {
            return 0; // No servicemen found, so no bookings
        }

        // Step 2: Match bookings where servicemen are involved
        const bookingCount = await Booking.countDocuments({
            servicemen: { $in: servicemenIds }
        });

        return bookingCount;

    } catch (error) {
        console.error('Error fetching booking count for provider:', error);
        throw new Error('Unable to fetch booking count');
    }
}
