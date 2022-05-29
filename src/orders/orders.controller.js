// Default

const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// Imports

// Functions

function bodyHasPropertyAndValue(property) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        const { data: { dishes, status } = {} } = req.body;
        const order = res.locals.order;

        if(property === "dishes") {

            if(!data[property]) {
                return next({
                    status: 400,
                    message: "Order must include a dish"
                });
            };

            if(!Array.isArray(dishes) || dishes.length <= 0) {
                return next({
                    status: 400,
                    message: "Order must include at least one dish"
                });
            };

            for(let i = 0; i < dishes.length; i++) {
                if(!dishes[i].quantity || dishes[i].quantity <= 0 || !Number.isInteger(dishes[i].quantity)) {
                    return next({
                        status: 400,
                        message: `Dish ${i} must have a quantity that is an integer greater than 0`
                    });
                };
            };

            return next();
            
        };

        if(property === "status") {

            if(order.status === "delivered" && status !== "delivered") {
                return next({
                    status: 400,
                    message: "A delivered order cannot be changed"
                });
            };

            if(!data[property] || data[property] === "invalid") {
                return next({
                    status: 400,
                    message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
                });
            };

            return next();

        };

        if(data[property]) {
            return next();
        };

        next({
            status: 400,
            message: `Order must include a ${property}`,
        });
    };
};

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const id = nextId();
    const newOrder = {
        id: id,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status ? status : "",
        dishes: dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

function list(req, res) {
    res.status(200).json({ data: orders});
};

function orderExists(req, res, next) {
    const { orderId } = req.params;   
    const foundOrder = orders.find((order) => order.id === orderId);
    if(foundOrder) {
        res.locals.order = foundOrder;
        return next();
    };
    next({
        status: 404,
        message: `Order does not exist: ${orderId}.`
    });
};

function read(req, res) {
    const order = res.locals.order;
    res.status(200).json({ data: order });
};

function update(req, res, next) {
    const order = res.locals.order;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const { orderId } = req.params;      
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
    if(id && orderId !== id) {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
        });
    }
    res.status(200).json({ data: order });
};


function destroy(req, res, next) {
    const order = res.locals.order;
    const { orderId } = req.params; 
    if(order.status !== "pending") {
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending"
        });
    };
    const index = orders.findIndex((order) => order.id === orderId);
    const deletedOrder = orders.splice(index, 1);
    res.sendStatus(204);
};

// Exports

module.exports = {
    create: [
        bodyHasPropertyAndValue("deliverTo"), 
        bodyHasPropertyAndValue("mobileNumber"),
        bodyHasPropertyAndValue("dishes"),
        create
    ],
    list,
    read: [
        orderExists,
        read
    ],
    update: [
        orderExists,
        bodyHasPropertyAndValue("deliverTo"), 
        bodyHasPropertyAndValue("mobileNumber"),
        bodyHasPropertyAndValue("dishes"),
        bodyHasPropertyAndValue("status"),
        update
    ],
    delete: [
        orderExists,
        destroy
    ]
};

