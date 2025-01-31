const Provider = require('../models/provider.model.js');

//Allows service providers to select a subscription plan and initiate payment.
const subscribeToPlan = async (req, res) => {
    const {user, subscriptionPlanId} = req.body;
    try {
        const providerSubscription = await Provider.findOneAndUpdate({ user, subscription_plan: subscriptionPlanId });
        res.status(200).json(providerSubscription)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const subscriptionDetails = async (req, res) => {
    const { user } = req.body
    try {
        let subscriptionDetails = await Provider.find({ user });
        res.status(200).json(subscriptionDetails.subscriptionPlan)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const paymentWebhook = async (req, res) => {
    try {
        console.log(req.body)
        res.status(200).json({status: "success"})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { subscribeToPlan, subscriptionDetails, paymentWebhook }