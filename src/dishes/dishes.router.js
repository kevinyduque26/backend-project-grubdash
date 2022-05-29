// Default

const router = require("express").Router();

// Imports

const controller = require("./dishes.controller");
const methodNotAllowed = require("./../errors/methodNotAllowed");

// Routers

router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);

// Exports

module.exports = router;
