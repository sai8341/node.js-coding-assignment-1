const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const addDays = require("date-fns/addDays");
// const { format } = require("date-fns");
const format = require("date-fns/format");

app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started Running");
    });
  } catch (e) {
    console.log(`DB Error ${e}`);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

// id	INTEGER
// todo	TEXT
// category	TEXT
// priority	TEXT
// status	TEXT
// due_date

app.get("/todos/", async (request, response) => {
  const { id, todo, category, status, priority, search_q } = request.query;
  const maximumPossibleValuesForStatus = ["TO DO", "IN PROGRESS", "DONE"];
  const maximumPossibleValuesForPriority = ["HIGH", "MEDIUM", "LOW"];
  const maximumPossibleValuesForCategory = ["WORK", "HOME", "LEARNING"];

  let getAllTodos = "";
  let data = null;

  if (status !== undefined) {
    if (maximumPossibleValuesForStatus.includes(status)) {
      getAllTodos = `SELECT * FROM todo WHERE status = '${status}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  if (priority !== undefined) {
    if (maximumPossibleValuesForPriority.includes(priority)) {
      getAllTodos = `SELECT * FROM todo WHERE priority = '${priority}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }

  if (priority !== undefined && status !== undefined) {
    if (
      maximumPossibleValuesForPriority.includes(priority) &&
      maximumPossibleValuesForStatus.includes(status)
    ) {
      getAllTodos = `SELECT * FROM todo WHERE priority LIKE '${priority}' AND status = '${status}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }

  if (search_q !== undefined) {
    if (search_q === "Buy") {
      getAllTodos = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
    }
  }
  if (category !== undefined && status !== undefined) {
    if (
      maximumPossibleValuesForCategory.includes(category) &&
      maximumPossibleValuesForStatus.includes(status)
    ) {
      getAllTodos = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (category !== undefined) {
    if (maximumPossibleValuesForCategory.includes(category)) {
      getAllTodos = `SELECT * FROM todo WHERE category = '${category}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  data = await db.all(getAllTodos);
  response.send(
    data.map((eachTodo) => convertDBObjectToResponseObject(eachTodo))
  );
});

// API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `SELECT * FROM todo WHERE id = ${todoId}`;

  const todo = await db.get(getTodo);
  response.send(convertDBObjectToResponseObject(todo));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const dateFormat = format(new Date(2021, 01, 22), "yyyy-MM-dd");

  if (date !== undefined) {
    if (dateFormat === date) {
      const getDateTodo = `SELECT * FROM todo WHERE due_date = '${dateFormat}'`;
      const getTodos = await db.get(getDateTodo);
      response.send(convertDBObjectToResponseObject(getTodos));
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

module.exports = app;
