import { Request, Response } from "express";
import * as subscriptionService from "./service";
import mongoose from "mongoose";
import Subscription from "./model"; 


/**
 * Get current subscription (real-time expiry check included)
 */
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Get latest subscription
    const subscription = await subscriptionService.getCurrentSubscription(
      new mongoose.Types.ObjectId(userId)
    );

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No active subscription found",
      });
    }

    // ✅ Calculate days remaining
    let daysRemaining = subscriptionService.calculateDaysRemaining(subscription.expiryDate);

    // ✅ If expired, set status to Expired
    if (subscription.status === "Expired") {
      daysRemaining = 0;
    }

    // ✅ Return clean, frontend-friendly object
    return res.status(200).json({
      success: true,
      data: {
        _id: subscription._id,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        razorpayOrderId: subscription.razorpayOrderId,
        razorpayPaymentId: subscription.razorpayPaymentId,
        daysRemaining,
        duration: subscription.duration,
        shift: subscription.shift,
        seatType: subscription.seatType,
        amountPaid: subscription.amountPaid,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update subscription status (admin use-case)
 */
export const updateSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Subscription ID
    const { status } = req.body;
    const userId = (req as any).user?.id; // Logged-in User ki ID

    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required" });
    }

    // --- SECURITY CHECK START ---
    // Pehle database se subscription nikalo check karne ke liye
    const existingSub = await Subscription.findById(id);
    
    if (!existingSub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Agar user Admin nahi hai, toh check karo ki kya ye uski apni sub hai?
    // (Maan ke chalte hain ki tumhare pass req.user.role hai)
    if ((req as any).user?.role !== 'admin' && existingSub.userId.toString() !== userId) {
      return res.status(403).json({ error: "You are not authorized to update this subscription" });
    }
    // --- SECURITY CHECK END ---

    const subscription = await subscriptionService.updateSubscriptionStatus(id, status);

    res.json({
      success: true,
      message: `Subscription status updated to ${status}`,
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};