import { poiJsonStore } from "./path/to/poi-json-store.js";

//update data in store to add modify isPrivate field we use this to retrofi
//privacy flag to the POIs

const runMigration = async () => {
  try {
    await poiJsonStore.migrateToIsPrivate();
    console.log("Data migration successful!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();