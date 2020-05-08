const express = require("express");
const Instagram = require("instagram-web-api");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(cors());
require("dotenv").config();
const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const config = {
  hashtag: "computer",
  usersCountToFollow: 3,
  likesCountToLike: 3,
  mode: "follow",
  comment: "",
};

app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Instagram Bot");
});

app.post("/actions", async (req, res) => {
  try {
    req.setTimeout(500000);
    const config = req.body;
    const token = req.header("Authorization");
    if (!token) res.status(401).send({ message: "Unauthorized" });

    const { username, password } = jwt.verify(token, process.env.PRIVATE_KEY);
    const client = new Instagram({ username, password });
    await client.login();
    await require("./main")(client, config);

    return res.send({ done: true });
  } catch (err) {
    return res.status(400).send({ done: false, error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { error, value: authObject } = userSchema.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const client = new Instagram(authObject);
    const { authenticated } = await client.login();

    const token = authenticated
      ? jwt.sign(authObject, process.env.PRIVATE_KEY)
      : null;

    return res.send({ success: authenticated, token });
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

app.post("/logout", async (req, res) => {
  try {
    await client.logout();
    return res.send({ success: true });
  } catch (err) {
    return res.send({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port);
