import { BargainCouponModel } from '@/models/BargainCoupon';
import { ProductModel } from '@/models/Product';
import { UserModel } from '@/models/User';
import { sendBargainExpiryReminderEmail } from '@/lib/email-templates';
import { connectToDatabase } from '@/lib/mongodb';
import { log } from '@/lib/logger';

export async function sendBargainExpiryReminders() {
  try {
    await connectToDatabase();
    
    // Find coupons expiring in next 6 hours
    const sixHoursFromNow = new Date(Date.now() + 6 * 60 * 60 * 1000);
    
    const expiringCoupons = await BargainCouponModel.find({
      isUsed: false,
      isActive: true,
      validUntil: {
        $lte: sixHoursFromNow,
        $gt: new Date(), // Not expired yet
      },
      reminderSent: { $ne: true }, // Haven't sent reminder yet
    });
    
    log.info(`Found ${expiringCoupons.length} bargain coupons needing expiry reminders`);
    
    for (const coupon of expiringCoupons) {
      try {
        const [product, user] = await Promise.all([
          ProductModel.findById(coupon.productId),
          UserModel.findById(coupon.userId),
        ]);
        
        if (product && user?.email) {
          const hoursLeft = Math.round(
            (coupon.validUntil.getTime() - Date.now()) / (1000 * 60 * 60)
          );
          
          if (hoursLeft > 0 && hoursLeft <= 6) {
            const emailSent = await sendBargainExpiryReminderEmail(
              coupon,
              product,
              {
                email: user.email,
                name: user.name,
              },
              hoursLeft
            );
            
            if (emailSent) {
              // Mark reminder as sent
              coupon.reminderSent = true;
              await coupon.save();
              log.info(`Expiry reminder sent for coupon ${coupon.code}`);
            }
          }
        }
      } catch (couponError) {
        log.error(`Error processing coupon ${coupon.code}:`, {error:couponError as Error});
      }
    }
  } catch (error) {
    log.error('Error in bargain expiry reminders cron:', {error:error as Error});
  }
}