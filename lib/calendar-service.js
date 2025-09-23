const { getCalendarClient } = require("./google-auth");

class CalendarService {
  constructor() {
    this.calendar = getCalendarClient();
  }

  async createGeneralEvent(calendarId, eventData) {
    try {
      console.log(
        "📅 Creating event with data:",
        JSON.stringify(eventData, null, 2)
      );

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        location: eventData.location,

        reminders: {
          useDefault: false,
          overrides: eventData.reminders || [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
        visibility: "public",
      };

      console.log("📧 Event object:", JSON.stringify(event, null, 2));

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: "none",
      });

      console.log("✅ Event created successfully:", response.data.id);
      console.log("🔗 Event link:", response.data.htmlLink);
      console.log("📅 Calendar ID used:", calendarId);
      console.log("🌐 Event visibility:", response.data.visibility);

      if (!response.data.id) {
        throw new Error("Event creation failed - no event ID returned");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error creating event:", error.message);
      console.error("📋 Error details:", error);
      throw new Error(`Failed to create general event: ${error.message}`);
    }
  }

  async createPrivateEvent(calendarId, eventData, allowedUsers = []) {
    try {
      console.log("🔐 Creating private event with calendarId:", calendarId);

      const usersText =
        allowedUsers.length > 0
          ? `\n\nPrivate Event - Intended for: ${allowedUsers.join(", ")}`
          : "";

      const event = {
        summary: eventData.title,
        description: eventData.description + usersText,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        location: eventData.location,

        visibility: "private",
        guestsCanSeeOtherGuests: false,
        reminders: {
          useDefault: false,
          overrides: eventData.reminders || [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: "none",
      });

      console.log("✅ Private event created:", response.data.id);
      console.log("🔗 Event link:", response.data.htmlLink);
      console.log("🔒 Event visibility:", response.data.visibility);

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create private event: ${error.message}`);
    }
  }

  async updateEvent(calendarId, eventId, updateData) {
    try {
      const event = {
        summary: updateData.title,
        description: updateData.description,
        start: updateData.startDateTime
          ? {
              dateTime: updateData.startDateTime,
              timeZone: updateData.timeZone || "UTC",
            }
          : undefined,
        end: updateData.endDateTime
          ? {
              dateTime: updateData.endDateTime,
              timeZone: updateData.timeZone || "UTC",
            }
          : undefined,
        location: updateData.location,
        attendees: updateData.attendees,
        reminders: updateData.reminders
          ? {
              useDefault: false,
              overrides: updateData.reminders,
            }
          : undefined,
      };

      Object.keys(event).forEach(
        (key) => event[key] === undefined && delete event[key]
      );

      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        resource: event,
        sendUpdates: "none",
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  async deleteEvent(calendarId, eventId) {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: "none",
      });
      return { success: true, message: "Event deleted successfully" };
    } catch (error) {
      console.error(`❌ Delete event error:`, error.message);

      if (error.message.includes("Resource has been deleted")) {
        return {
          success: false,
          message: "Event was already deleted or does not exist",
          error: "ALREADY_DELETED",
        };
      }

      if (error.message.includes("Not Found")) {
        return {
          success: false,
          message: "Event not found",
          error: "NOT_FOUND",
        };
      }

      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async getEvents(calendarId, timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to get events: ${error.message}`);
    }
  }

  async getCommonEvents(calendarId, timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      const commonEvents =
        response.data.items?.filter(
          (event) => event.visibility === "public" || !event.visibility
        ) || [];

      return commonEvents;
    } catch (error) {
      throw new Error(`Failed to get common events: ${error.message}`);
    }
  }

  async getPrivateEvents(calendarId, timeMin, timeMax, userEmail) {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      const privateEvents =
        response.data.items?.filter((event) => {
          if (event.visibility === "private") {
            return event.attendees?.some(
              (attendee) => attendee.email === userEmail
            );
          }
          return false;
        }) || [];

      return privateEvents;
    } catch (error) {
      throw new Error(`Failed to get private events: ${error.message}`);
    }
  }

  async getCalendarInfo() {
    try {
      console.log("📋 Checking calendar access...");

      const calendarList = await this.calendar.calendarList.list();
      console.log("📅 Available calendars:");
      calendarList.data.items?.forEach((cal) => {
        console.log(
          `  - ${cal.id} (${cal.summary}) - Access: ${cal.accessRole}`
        );
      });

      return {
        calendars: calendarList.data.items,
        primaryCalendar: "primary",
      };
    } catch (error) {
      console.error("❌ Error checking calendar access:", error.message);
      throw new Error(`Failed to get calendar info: ${error.message}`);
    }
  }

  async testEventCreation(calendarId = "primary") {
    try {
      console.log("🧪 Testing event creation with calendarId:", calendarId);

      try {
        const calendarInfo = await this.calendar.calendars.get({ calendarId });
        console.log("📅 Calendar found:", calendarInfo.data.summary);
      } catch (calError) {
        console.error("❌ Cannot access calendar:", calError.message);
        throw new Error(
          `Calendar access denied. Please share calendar ${calendarId} with service account: calendar-task-service@calendar-api-472512.iam.gserviceaccount.com`
        );
      }

      const testEvent = {
        title: "Test Event - " + new Date().toISOString(),
        description: "Test event to verify calendar API functionality",
        startDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        timeZone: "Europe/Istanbul",
      };

      const result = await this.createGeneralEvent(calendarId, testEvent);
      console.log("✅ Test event created successfully!");
      console.log("🔗 Event URL:", result.htmlLink);

      return result;
    } catch (error) {
      console.error("❌ Test event creation failed:", error.message);
      throw error;
    }
  }
}

module.exports = { CalendarService };
