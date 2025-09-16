const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const {
  validateGeneralEvent,
  validatePrivateEvent,
  validateEventUpdate,
  validateQueryParams,
} = require("../middleware/validation");

router.get("/events", validateQueryParams, calendarController.getEvents);

router.post(
  "/events/general",
  validateGeneralEvent,
  calendarController.createGeneralEvent
);

router.post(
  "/events/private",
  validatePrivateEvent,
  calendarController.createPrivateEvent
);

router.put(
  "/events/:eventId",
  validateEventUpdate,
  calendarController.updateEvent
);

router.delete("/events/:eventId", calendarController.deleteEvent);

module.exports = router;
