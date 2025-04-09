import { storage } from "./src/services/storage.js";

const STORAGE_KEY = "@jusagenda_events";

// IDs of known invalid events to remove
const INVALID_EVENT_IDS = [
  "m8vswslwioo1clazw",
  "m8vsz2ifctzd0zeku",
  "m99uwwhylapv8u5mv",
];

async function cleanupInvalidEvents() {
  try {
    const events = (await storage.getItem(STORAGE_KEY)) || [];
    const initialCount = events.length;

    const cleanedEvents = events.filter(
      (event) => !INVALID_EVENT_IDS.includes(event.id)
    );

    const removedCount = initialCount - cleanedEvents.length;

    if (removedCount > 0) {
      await storage.setItem(STORAGE_KEY, cleanedEvents);
      console.log(
        `Removed ${removedCount} invalid events: ${INVALID_EVENT_IDS.join(", ")}`
      );
    } else {
      console.log("No invalid events found to remove.");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

cleanupInvalidEvents();
