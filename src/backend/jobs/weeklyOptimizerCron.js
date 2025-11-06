const cron = require('node-cron');
const weeklyOptimizerService = require('../services/weeklyOptimizerService');
const { prisma } = require('../lib/db');

class WeeklyOptimizerCron {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Calculate next optimization time based on user's schedule preferences
   */
  calculateNextOptimizationTime(scheduleDay, scheduleTime) {
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    
    // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    
    const targetDay = dayMap[scheduleDay];
    const currentDay = now.getDay();
    
    // Calculate days until target day
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) {
      daysUntil += 7; // Next week
    } else if (daysUntil === 0) {
      // Same day - check if time has passed
      const targetTime = new Date(now);
      targetTime.setHours(hours, minutes, 0, 0);
      
      if (now >= targetTime) {
        daysUntil = 7; // Next week
      }
    }
    
    const nextTime = new Date(now);
    nextTime.setDate(now.getDate() + daysUntil);
    nextTime.setHours(hours, minutes, 0, 0);
    
    return nextTime;
  }

  /**
   * Update next optimization times for all users
   */
  async updateNextOptimizationTimes() {
    try {
      // Check if Prisma is available
      if (!prisma || !prisma.weekly_optimizer_settings) {
        console.log('⚠️ Prisma not yet initialized, skipping update');
        return;
      }

      const settings = await prisma.weekly_optimizer_settings.findMany({
        where: { enabled: true }
      });

      for (const setting of settings) {
        const nextTime = this.calculateNextOptimizationTime(
          setting.schedule_day,
          setting.schedule_time
        );

        await prisma.weekly_optimizer_settings.update({
          where: { id: setting.id },
          data: { next_optimization_time: nextTime }
        });
      }

      console.log(`✅ Updated next optimization times for ${settings.length} users`);
    } catch (error) {
      console.error('Error updating next optimization times:', error);
    }
  }

  /**
   * Process users whose optimization time has arrived
   */
  async processScheduledOptimizations() {
    if (this.isRunning) {
      console.log('⏭️  Weekly Optimizer cron already running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      // Check if Prisma is available
      if (!prisma || !prisma.weekly_optimizer_settings) {
        console.log('⚠️ Prisma not yet initialized, skipping processing');
        this.isRunning = false;
        return;
      }

      const now = new Date();

      // Find users whose next_optimization_time has passed
      const dueSettings = await prisma.weekly_optimizer_settings.findMany({
        where: {
          enabled: true,
          next_optimization_time: {
            lte: now
          }
        }
      });

      if (dueSettings.length === 0) {
        console.log('✅ No users due for weekly optimization');
        this.isRunning = false;
        return;
      }

      console.log(`🔄 Processing weekly optimization for ${dueSettings.length} users...`);

      let successCount = 0;
      let errorCount = 0;

      for (const setting of dueSettings) {
        try {
          // Add 2-second delay between users to respect API rate limits
          if (successCount + errorCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          await weeklyOptimizerService.optimizeUserWeek(setting.user_id);
          
          // Calculate and update next optimization time
          const nextTime = this.calculateNextOptimizationTime(
            setting.schedule_day,
            setting.schedule_time
          );

          await prisma.weekly_optimizer_settings.update({
            where: { id: setting.id },
            data: { next_optimization_time: nextTime }
          });

          successCount++;
        } catch (error) {
          console.error(`Error processing user ${setting.user_id}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Weekly optimization batch complete: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      console.error('Error in weekly optimizer cron:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start the cron job
   */
  start() {
    if (this.cronJob) {
      console.log('⚠️  Weekly Optimizer cron already started');
      return;
    }

    // Check if Weekly Optimizer is enabled
    const isEnabled = process.env.WEEKLY_OPTIMIZER_ENABLED === 'true';
    if (!isEnabled) {
      console.log('⏭️  Weekly Optimizer is disabled (WEEKLY_OPTIMIZER_ENABLED=false)');
      return;
    }

    // Run every hour at minute 0
    // Cron format: minute hour day month weekday
    this.cronJob = cron.schedule('0 * * * *', async () => {
      console.log('⏰ Weekly Optimizer cron triggered');
      await this.processScheduledOptimizations();
    });

    console.log('✅ Weekly Optimizer cron started (runs every hour)');

    // Initialize next optimization times on startup
    this.updateNextOptimizationTimes().catch(error => {
      console.error('Error initializing next optimization times:', error);
    });
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('🛑 Weekly Optimizer cron stopped');
    }
  }

  /**
   * Manually trigger optimization for a specific user
   */
  async triggerManualOptimization(userId) {
    try {
      console.log(`🔄 Manual optimization triggered for user ${userId}`);
      const result = await weeklyOptimizerService.optimizeUserWeek(userId);
      return result;
    } catch (error) {
      console.error(`Error in manual optimization for user ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = new WeeklyOptimizerCron();

