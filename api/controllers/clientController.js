const User = require('../models/user.model.js');
const Client = require('../models/client.model.js');



const register = async (req, res) => {
        const session = await mongoose.startSession(); // Start transaction
        session.startTransaction();
      
        try {
          const { email, password, role, name, phone, organisation, branch } = req.body;
      
          // Validate role (ensure it's for a client)
          if (!["Client", "ClientAdmin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be Client or ClientAdmin." });
          }
      
          // Check if email is already registered
          const existingUser = await User.findOne({ email }).session(session);
          if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
          }
      
          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);
      
          // Create new User
          const newUser = new User({
            email,
            password: hashedPassword,
            role,
          });
          await newUser.save({ session });
      
          // Create new Client
          const newClient = new Client({
            user: newUser._id,
            name,
            phone,
            organisation,
            branch: branch || null,
          });
          await newClient.save({ session });
      
          // Commit transaction
          await session.commitTransaction();
          session.endSession();
      
          res.status(201).json({ message: "Registration successful", user: newUser, client: newClient });
      
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          res.status(500).json({ error: error.message });
        }
}

const viewBookings = async (req, res) => {
    const { customer } = req.body
    try {
        let bookings = await Booking.find({ customer });
        res.status(200).json(bookings)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { register, viewBookings }