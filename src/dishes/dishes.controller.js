// Default

const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

// Imports

// Functions

function bodyHasPropertyAndValue(property) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if(property === "price" && data.price <= 0) {
           return next({
               status: 400,
               message: "Dish must have a price that is an integer greater than 0"
           });
        } else if(property === "price" && !Number.isInteger(data.price)) {
            return next({
                status: 400,
                message: "Dish must have a price that is an integer greater than 0"
            });
        } else if(data[property]) {
            return next();
        };
        next({
            status: 400,
            message: `Dish must include a ${property}`,
        });
    };
};

function create(req, res) {
    const { data: { name, description, price, image_url  } = {} } = req.body;
    const id = nextId();
    const newDish = {
        id: id,
        name: name,
        description: description,
        price: price,
        image_url: image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

function list(req, res) {
    res.status(200).json({ data: dishes });
};

function dishExists(req, res, next) {
    const { dishId } = req.params;   
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if(foundDish) {
        res.locals.dish = foundDish;
        return next();
    };
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}.`
    });
};

function read(req, res) {
    const dish = res.locals.dish;
    res.status(200).json({ data: dish });
};

function update(req, res, next) {
    const dish = res.locals.dish;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    const { dishId } = req.params;      
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    if(id && dishId !== id) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        });
    }
    res.status(200).json({ data: dish });
};

// Exports

module.exports = {
    create: [
        bodyHasPropertyAndValue("name"), 
        bodyHasPropertyAndValue("description"),
        bodyHasPropertyAndValue("price"),
        bodyHasPropertyAndValue("image_url"),
        create
    ],
    list,
    read: [
        dishExists,
        read
    ],
    update: [
        dishExists,
        bodyHasPropertyAndValue("name"), 
        bodyHasPropertyAndValue("description"),
        bodyHasPropertyAndValue("price"),
        bodyHasPropertyAndValue("image_url"),
        update,
    ]
};

