import express from "express";
import { pool } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.render("index");
});


app.get("/q1", async (req, res) => {
  const lname = (req.query.lname || "").trim();
  const [rows] = await pool.query(`
    SELECT h.horseName, h.age, t.fname AS trainer_fname, t.lname AS trainer_lname
    FROM Horse h
    JOIN Owns o ON h.horseId = o.horseId
    JOIN Owner ow ON o.ownerId = ow.ownerId
    JOIN Trainer t ON t.stableId = h.stableId
    WHERE (? = '' OR ow.lname = ?)`, [lname, lname]);

  res.render("table", {
    title: " — Horses by Owner",
    headers: rows.length ? Object.keys(rows[0]) : [],
    rows,
    form: { action: "/q1", fields: [{ name: "lname", label: "Owner last name", value: lname }] }
  });
});



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
