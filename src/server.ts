import express, { request, response } from "express";

const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req = request, res = response) => {
  res.send("This is my Car-station");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
