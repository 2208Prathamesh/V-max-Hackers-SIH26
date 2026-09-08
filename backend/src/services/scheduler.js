import cron from 'node-cron';
import alertService from './alertService.js';

/**
 * Scheduler manages all background recurring tasks for the WeatherGPT backend.
 */
const Scheduler = {
  init() {
    console.log('📅 Initializing Background Scheduler...');
    this.scheduleAlertSync();
    // Add other scheduled tasks here (e.g., cleaning expired notifications)
  },

  /**
   * Sync official IMD alerts every 15 minutes.
   */
  scheduleAlertSync() {
    // Every 15 minutes: '*/15 * * * *'
    cron.schedule('*/15 * * * *', async () => {
      try {
        console.log('⏰ [Scheduler] Starting scheduled IMD alert sync...');
        const result = await alertService.syncOfficialAlerts({ force: true });

        if (result.skipped) {
          console.log('ℹ️ [Scheduler] IMD sync skipped (TTL not reached).');
        } else {
          console.log(`✅ [Scheduler] IMD sync completed. Synced ${result.syncedCount} alerts.`);
        }
      } catch (error) {
        console.error('❌ [Scheduler] IMD alert sync failed:', error.message);
      }
    });

    console.log('🔔 Scheduled: IMD Alert Sync (every 15 minutes)');
  }
};

export default Scheduler;
