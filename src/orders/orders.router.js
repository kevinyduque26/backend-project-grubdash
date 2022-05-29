// Default

const router = require("express").Router();

// Imports

const controller = require("./orders.controller");
const methodNotAllowed = require("./../errors/methodNotAllowed");

// Routers

router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

router.route("/:orderId").get(controller.read).put(controller.update).delete(controller.delete).all(methodNotAllowed);

// Exports

module.exports = router;
