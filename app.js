const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    category: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { id, todo, status, category, priority, search_q } = request.query;

  let getAllTodos = `SELECT * FROM todo`;
  let data = null;

  if (status !== undefined) {
    if (["TO DO", "IN PROGRESS", "DONE"].includes(status)) {
      getAllTodos = `SELECT * FROM todo WHERE status = '${status}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  if (priority !== undefined) {
    if (["HIGH", "LOW", "MEDIUM"].includes(priority)) {
      getAllTodos = `SELECT * FROM todo WHERE priority = '${priority}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }

  if (priority !== undefined && status !== undefined) {
    if (
      ["HIGH", "LOW", "MEDIUM"].includes(priority) &&
      ["TO DO", "IN PROGRESS", "DONE"].includes(status)
    ) {
      getAllTodos = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}'`;
    } else {
      response.status(400);
    }
  }

  if (search_q !== undefined) {
    if (["Buy"].includes(search_q)) {
      getAllTodos = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
    }
  }

  if (category !== undefined && status !== undefined) {
    if (
      ["WORK", "HOME", "LEARNING"].includes(category) &&
      ["TO DO", "IN PROGRESS", "DONE"].includes(status)
    ) {
      getAllTodos = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (category !== undefined) {
    if (["WORK", "HOME", "LEARNING"].includes(category)) {
      getAllTodos = `SELECT * FROM todo WHERE category = '${category}'`;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (category !== undefined && priority !== undefined) {
    if (
      ["WORK", "HOME", "LEARNING"].includes(category) &&
      ["HIGH", "LOW", "MEDIUM"].includes(priority)
    ) {
      getAllTodos = `SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}'`;
    }
  }

  data = await db.all(getAllTodos);
  response.send(
    data.map((eachTodo) => convertDBObjectToResponseObject(eachTodo))
  );
});

module.exports = app;
