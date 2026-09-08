import cron from 'node-cron';
import alertService from './alertService.js';
import newsService from './newsService.js';

/**
 * Scheduler manages all background recurring tasks for the WeatherGPT backend.
 */
const Scheduler = {
  init() {
    console.log('📅 Initializing Background Scheduler...');
    this.scheduleAlertSync();
    this.scheduleNewsSync();
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
  },

  /**
   * Sync live automated India & Global weather/flood news every 15 minutes.
   */
  scheduleNewsSync() {
    // Initial sync on startup (non-blocking)
    setTimeout(() => {
      newsService.syncLiveNews().catch(err => {
        console.warn('⚠️ [Scheduler] Initial live news sync failed:', err.message);
      });
    }, 2000);

    // Every 15 minutes: '*/15 * * * *'
    cron.schedule('*/15 * * * *', async () => {
      try {
        console.log('⏰ [Scheduler] Starting scheduled automated news sync...');
        const res = await newsService.syncLiveNews();
        console.log(`✅ [Scheduler] Automated news sync completed. Count: ${res?.count || 0}`);
      } catch (error) {
        console.error('❌ [Scheduler] Automated news sync failed:', error.message);
      }
    });

    console.log('🔔 Scheduled: Automated India & Global Weather News Sync (every 15 minutes)');
  }
};

export default Scheduler;
