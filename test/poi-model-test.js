import { assert } from "chai";
import { db } from "../src/models/db.js";
import { testPOIs, eiffelTower } from "./fixtures.js";
import "../src/server.js";


suite("POI Model tests", () => {

  setup(async () => {
    db.init("json");
    await db.poiStore.deleteAllPOIs();
    for (let i = 0; i < testPOIs.length; i += 1) {
      testPOIs[i] = await db.poiStore.addPOI(testPOIs[i]);
    }
  });

  test("create a POI", async () => {
    const poi = await db.poiStore.addPOI(eiffelTower);
    assert.equal(poi.title, eiffelTower.title);
    assert.equal(poi.description, eiffelTower.description);
    assert.equal(poi.latitude, eiffelTower.latitude);
    assert.equal(poi.longitude, eiffelTower.longitude);
    assert.isDefined(poi._id);
  });

  test("delete all POIs", async () => {
    let returnedPOIs = await db.poiStore.getAllPOIs();
    assert.equal(returnedPOIs.length, testPOIs.length);
    await db.poiStore.deleteAllPOIs();
    returnedPOIs = await db.poiStore.getAllPOIs();
    assert.equal(returnedPOIs.length, 0);
  });

  test("get a POI - success", async () => {
    const poi = await db.poiStore.addPOI(eiffelTower);
    const returnedPOI = await db.poiStore.getPOIById(poi._id);
    assert.deepEqual(poi, returnedPOI);
  });

  test("delete One POI - success", async () => {
    const id = testPOIs[0]._id;
    await db.poiStore.deletePOIById(id);
    const returnedPOIs = await db.poiStore.getAllPOIs();
    assert.equal(returnedPOIs.length, testPOIs.length - 1);
    const deletedPOI = await db.poiStore.getPOIById(id);
    assert.isNull(deletedPOI);
  });

  test("get a POI - bad params", async () => {
    assert.isNull(await db.poiStore.getPOIById(""));
    assert.isNull(await db.poiStore.getPOIById());
  });

  test("delete One POI - fail", async () => {
    await db.poiStore.deletePOIById("bad-id");
    const allPOIs = await db.poiStore.getAllPOIs();
    assert.equal(testPOIs.length, allPOIs.length);
  });
});
