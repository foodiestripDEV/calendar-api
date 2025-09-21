const Joi = require("joi");

const calendarEventSchema = Joi.object({
  calendarId: Joi.string().required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow(""),
  startDateTime: Joi.date().iso().required(),
  endDateTime: Joi.date().iso().min(Joi.ref("startDateTime")).required(),
  location: Joi.string().max(255).allow(""),
  timeZone: Joi.string().default("UTC"),
  attendees: Joi.array()
    .items(
      Joi.object({
        email: Joi.string().email().required(),
      })
    )
    .default([]),
  reminders: Joi.array()
    .items(
      Joi.object({
        method: Joi.string().valid("email", "popup").required(),
        minutes: Joi.number().integer().min(0).required(),
      })
    )
    .default([]),
});

const privateEventSchema = calendarEventSchema.keys({
  allowedUsers: Joi.array().items(Joi.string().email()).min(1).required(),
});

const eventUpdateSchema = Joi.object({
  calendarId: Joi.string().required(),
  title: Joi.string().min(1).max(255),
  description: Joi.string().max(1000).allow(""),
  startDateTime: Joi.date().iso(),
  endDateTime: Joi.date()
    .iso()
    .when("startDateTime", {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref("startDateTime")),
      otherwise: Joi.date().iso(),
    }),
  location: Joi.string().max(255).allow(""),
  timeZone: Joi.string(),
  attendees: Joi.array().items(
    Joi.object({
      email: Joi.string().email().required(),
    })
  ),
  reminders: Joi.array().items(
    Joi.object({
      method: Joi.string().valid("email", "popup").required(),
      minutes: Joi.number().integer().min(0).required(),
    })
  ),
}).min(2);

const taskSchema = Joi.object({
  taskListId: Joi.string().required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow(""),
  dueDate: Joi.date().iso(),
  status: Joi.string().valid("needsAction", "completed").default("needsAction"),
});

const taskUpdateSchema = Joi.object({
  taskListId: Joi.string().required(),
  title: Joi.string().min(1).max(255),
  description: Joi.string().max(1000).allow(""),
  dueDate: Joi.date().iso(),
  status: Joi.string().valid("needsAction", "completed"),
}).min(2);

const validateGeneralEvent = (req, res, next) => {
  const { error, value } = calendarEventSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errorMessages,
    });
  }

  req.body = value;
  next();
};

const validatePrivateEvent = (req, res, next) => {
  const { error, value } = privateEventSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errorMessages,
    });
  }

  req.body = value;
  next();
};

const validateEventUpdate = (req, res, next) => {
  const { error, value } = eventUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errorMessages,
    });
  }

  req.body = value;
  next();
};

const validateTask = (req, res, next) => {
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errorMessages,
    });
  }

  req.body = value;
  next();
};

const validateTaskUpdate = (req, res, next) => {
  const { error, value } = taskUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errorMessages,
    });
  }

  req.body = value;
  next();
};

const validateQueryParams = (req, res, next) => {
  const querySchema = Joi.object({
    calendarId: Joi.string(),
    taskListId: Joi.string(),
    userEmail: Joi.string().email(), // Private events için gerekli
    timeMin: Joi.date().iso(),
    timeMax: Joi.date()
      .iso()
      .when("timeMin", {
        is: Joi.exist(),
        then: Joi.date().min(Joi.ref("timeMin")),
      }),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
  });

  const { error, value } = querySchema.validate(req.query, {
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: "Invalid query parameters",
      details: errorMessages,
    });
  }

  req.query = value;
  next();
};

module.exports = {
  validateGeneralEvent,
  validatePrivateEvent,
  validateEventUpdate,
  validateTask,
  validateTaskUpdate,
  validateQueryParams,
};
