const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const {
  validateGeneralEvent,
  validatePrivateEvent,
  validateEventUpdate,
  validateQueryParams,
} = require("../middleware/validation");

router.get("/events/common", validateQueryParams, calendarController.getCommonEvents);
router.get("/events/private", validateQueryParams, calendarController.getPrivateEvents);
router.get("/events", validateQueryParams, calendarController.getEvents);

router.post(
  "/events",
  validateGeneralEvent, 
  calendarController.createEvent
);

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
  "/events/common/:eventId", 
  validateEventUpdate,
  calendarController.updateCommonEvent
);

router.put(
  "/events/private/:eventId",
  validateEventUpdate, 
  calendarController.updatePrivateEvent
);

router.put(
  "/events/:eventId",
  validateEventUpdate,
  calendarController.updateEvent
);

router.delete("/events/common/:eventId", calendarController.deleteCommonEvent);
router.delete("/events/private/:eventId", calendarController.deletePrivateEvent);
router.delete("/events/:eventId", calendarController.deleteEvent);

router.get("/debug/calendar-access", calendarController.checkCalendarAccess);
router.post("/debug/test-event", calendarController.testEventCreation);

module.exports = router;
