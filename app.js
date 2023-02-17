const express = require("express");
const { format } = require("date-fns");

const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is started successfully");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

initialize();

const priorityandstatusandcategory = (object) => {
  return (
    object.category !== undefined &&
    object.status !== undefined &&
    object.priority !== undefined
  );
};

const priorityandcategory = (object) => {
  return object.category !== undefined && object.priority !== undefined;
};

const statusandcategory = (object) => {
  return object.category !== undefined && object.status !== undefined;
};

const havingcategory = (object) => {
  return object.category !== undefined;
};
const priorityandstatus = (object) => {
  return object.status !== undefined && object.priority !== undefined;
};

const havingstatus = (object) => {
  return object.status !== undefined;
};

const havingpriority = (object) => {
  return object.priority !== undefined;
};

const makeobjectdata = (object) => {
  return {
    id: object.id,
    todo: object.todo,
    priority: object.priority,
    status: object.status,
    category: object.category,
    dueDate: object.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  const { priority, status, search_q = "", category } = request.query;
  console.log(category);
  let todolist;

  switch (true) {
    case priorityandstatusandcategory(request.query):
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (
        priority !== "HIGH" &&
        priority !== "MEDIUM" &&
        priority !== "LOW"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%' AND priority='${priority}' AND category='${category}' AND status='${status}';`;
      }

      break;
    case priorityandcategory(request.query):
      if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (
        priority !== "HIGH" &&
        priority !== "MEDIUM" &&
        priority !== "LOW"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%' AND priority='${priority}' AND category='${category}';`;
      }

      break;
    case priorityandstatus(request.query):
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        priority !== "HIGH" &&
        priority !== "MEDIUM" &&
        priority !== "LOW"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%' AND priority='${priority}'  AND status='${status}';`;
      }

      break;

    case statusandcategory(request.query):
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%'  AND category='${category}' AND status='${status}';`;
      }

      break;
    case havingstatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%'  AND  status='${status}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;
    case havingpriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%' AND priority='${priority}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case havingcategory(request.query):
      console.log(category);
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%' AND  category='${category}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      todolist = `
    SELECT 
    * 
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%';`;
      break;
  }
  if (todolist !== undefined) {
    const getalltodos = await db.all(todolist);
    console.log(getalltodos);
    response.send(getalltodos.map((object) => makeobjectdata(object)));
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getdetails = `
  SELECT * FROM 
  todo
  WHERE 
  id=${todoId};`;

  const gettodoiditem = await db.get(getdetails);
  response.send(gettodoiditem);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(date);
  let newdate = format(new Date(date), "yyyy-MM-dd");

  const getdetails = `
  SELECT * FROM 
  todo
   WHERE 
  due_date='${newdate}';`;
  const gettodoiditem = await db.all(getdetails);

  if (gettodoiditem[0] !== undefined) {
    response.send(gettodoiditem.map((object) => makeobjectdata(object)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, category, status, dueDate } = request.body;

  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (dueDate === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const getdetails = `
    INSERT INTO 
    todo (id,todo,priority,status,category,due_date)
    VALUES(${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
    const updatedata = await db.run(getdetails);
    response.send("Todo Successfully Added");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const fulldata = request.body;

  let temp;
  const { todoId } = request.params;

  switch (true) {
    case fulldata.status !== undefined:
      temp = "Status";
      break;
    case fulldata.category !== undefined:
      temp = "Category";
      break;
    case fulldata.todo !== undefined:
      temp = "Todo";
      break;
    case fulldata.priority !== undefined:
      temp = "Priority";
      break;
    case fulldata.dueDate !== undefined:
      temp = "Due Date";
      break;
  }

  const todoiddetails = `
    SELECT * FROM
    todo
    WHERE
    id=${todoId};`;
  const totaldetails = await db.get(todoiddetails);
  const {
    todo = totaldetails.todo,
    priority = totaldetails.priority,
    category = totaldetails.category,
    status = totaldetails.status,
    dueDate = totaldetails.dueDate,
  } = request.body;
  console.log(priority);

  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else {
    const getdetails = `
    UPDATE 
    todo
    SET
    todo='${todo}',
    status='${status}',
    priority='${priority}',
    category='${category}',
    due_date='${dueDate}';
    `;
    const totalupdate = await db.run(getdetails);
    console.log("wow");
    console.log(totalupdate);
    response.send(`${temp} Updated`);
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const removedetails = `
  DELETE FROM
todo
WHERE
id=${todoId};`;
  const updatedetails = await db.run(removedetails);
  response.send("Todo Deleted");
});

module.exports = app;
