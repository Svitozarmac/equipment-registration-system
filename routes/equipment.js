const express = require('express');
const equipmentRouter = express.Router();

// Import models
const Equipment = require("../models/equipment");
const Room = require("../models/room");
const EquipmentType = require("../models/equipmentType");


// GET equipment Home page (index page)
equipmentRouter.get('/', function(req, res, next) {  // This actually maps to /equipment because we import the route with an /equipment prefix
    res.render("home", { 
        title: "Home Page", 
        layout: false
    }); // disables layout.ejs just for the home page   
});

// GET equipment About page
equipmentRouter.get('/about', function(req, res, next) {
    res.render("about", {
        title: "About This Project"
    });
    
});

// GET equipment Help page
equipmentRouter.get('/help', function(req, res, next) {
    res.render("help", {
        title: 'Help & Instructions'
    });
});

// Register new equipment
equipmentRouter.route('/create')
.get((req, res, next) => { // Display equipment create form on GET
    Room.find().sort({name: 1})
    .then((allRooms) => {
        // Get enum values from the schema
        const equipmentTypes = EquipmentType.schema.path("name").enumValues;

        res.render("equipment_form", { 
            title: "Register Equipment",
            room_list: allRooms,
            equipment_types: equipmentTypes
        });
    })
    .catch((err) => {
        console.error("Error retrieving room list:", err);
        next(err);
    });
})   
.post((req, res, next) => { // Handle equipment create on POST
    
    // Create an Equipment object.
    Equipment.create({
        name: req.body.name.trim(),
        type: req.body.type.trim(),
        cost: Number(req.body.cost), // Cast cost to Number
        room: req.body.room,
        registeredBy: req.body.reg_name.trim()
    })
    .then(newEquipment => { 
        // populate room after creation
        return Equipment.findById(newEquipment._id).populate("room");
    })
    .then(populatedEquipment => {
        res.render("equipment_instance_info", { // render the individual equipment instance info page
            title: "Equipment Registered Successfully!",
            success_message: "New piece of equipment registered successfully!",
            equipment_instance: populatedEquipment,
            isDelete: false,
            isUpdateReport: false
        });
    
    })
    .catch(err => {
        console.error("Error creating new equipment instance: ", err.message);
        next(err);
    });
})
.put((req, res, next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/create');
})
.delete((req, res, next) => { 
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/create');
});

// Delete equipment GET request
equipmentRouter.route('/delete')
.get((req, res, next) => {
    // Find all equipment list and pass it to the delete form
    Equipment.find({}, "name type room")
    .sort({name: 1}) // 1 means sort in ascending order (alphabetically)
    .populate("room")
    .then((allEquipment) => {
        res.render("equipment_delete", { // render equipment delete form
            title: "Delete equipment",
            error_message: null,
            equipment_list: allEquipment,
            equipment_by_id: null
        });
    })
    .catch(err => {
        console.error("Error retrieving equipment list:", err);
        next(err);
    });
})
.post((req, res, next) => { 
    res.statusCode = 403;
    res.end('POST operation not supported on /equipment/:id');
})
.put((req, res, next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/:id');
})
.delete((req, res, next) => { // Delete 
    const { equipmentid, action } = req.body;

    // Handle cancel
    if (action === "cancel") {
        return res.redirect('/equipment');
    }

    // Check if no equipment was selected
    if (!equipmentid) {
        // Find all equipment list and pass it to the delete form
        return Equipment.find({}, "name type room")
        .sort({name: 1}) // 1 means sort in ascending order (alphabetically)
        .populate("room")
        .then((allEquipment) => {
            res.render("equipment_delete", { // render equipment delete form
                title: "Delete equipment",
                error_message: "Please select a piece of equipment to delete.",
                equipment_list: allEquipment,
                equipment_by_id: null
            });
        })
        .catch(err => {
            console.error("Error retrieving equipment list:", err);
            next(err);
        });
    }

    // Proceed with deletion
    Equipment.findByIdAndDelete(equipmentid)
    .then (() => {
        res.render("equipment_instance_info", {
            title: "Equipment deleted",
            success_message: "Equipment deleted successfully!",
            equipment_instance: null,
            isDelete: true,
            isUpdateReport: false
        });
    })
    .catch(err => {
        console.error("Something went wrong:", err);
        next(err);
    });
});



// Update equipment GET request
equipmentRouter.route('/update')
.get((req, res, next) => {
    // Find all equipment list and pass it to the update form
    Equipment.find({}, "name type room")
    .sort({name: 1}) // 1 means sort in ascending order (alphabetically)
    .populate("room")
    .then((allEquipment) => {
        res.render("equipment_update_select", { // render update form to select the equipment
            title: "Edit equipment",
            equipment_list: allEquipment,
            error_message: null
        });
    })
    .catch(err => {
        console.error("Error retrieving equipment list:", err);
        next(err);
    });
})
.post((req, res, next) => { 
    const { equipmentid } = req.body;

    // Check if no equipment was selected
    if (!equipmentid) {
        // Find all equipment list and pass it to the update select form
        return Equipment.find({}, "name type room")
        .sort({name: 1}) // 1 means sort in ascending order (alphabetically)
        .populate("room")
        .then((allEquipment) => {
            res.render("equipment_update_select", { // render update form to select the equipment
                title: "Edit equipment",
                equipment_list: allEquipment,
                error_message: "Please select a piece of equipment to edit."
            });
        })
        .catch(err => {
            console.error("Error retrieving equipment list:", err);
            next(err);
        });  
    }

    // Find piece of equipment by given id and pass it to the update form
    Equipment.findById(equipmentid)
    .then(equipment_piece => {
        // Retrieve a list of rooms
        return Room.find().sort({name: 1})
        .then((allRooms) => {
            if (!allRooms) {
                const err = new Error("Error retrieving list of rooms");
                err.status = 404;
                throw err;
            }
            // Get enum values from the schema
            const equipmentTypes = EquipmentType.schema.path("name").enumValues;
            // Render update form
            res.render("equipment_update", {
                title: "Edit equipment",
                piece_of_equipment: equipment_piece,
                room_list: allRooms,
                equipment_types: equipmentTypes
            })
        });      
    })
    .catch(err => {
        console.error("Something went wrong: ", err);
        next(err);
    });
})
.put((req, res, next) => { // Update 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/update');
})
.delete((req, res, next) => { // Delete 
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/update');  
});



// Search for all the equipment registered in a particular room
equipmentRouter.route('/search/room')
.get((req, res, next) => {
    // Find all rooms and pass to the search form
    Room.find().sort({name: 1})
    .then((allRooms) => {
        res.render("search_form_room", {
            title: "Select Room",
            room_list: allRooms,
            title_search: "Search Equipment By Room",
            error_message: null,
            search_: true,
            equipment_list: []
        });
    })
    .catch(err => {
        console.error("Error retrieving room list:", err);
        next(err);
    })
})
.post((req, res, next) => { 
    const { room } = req.body;

    // Check if no room was selected
    if (!room) {
        return Room.find().sort({name: 1})
        .then((allRooms) => {
            res.render("search_form_room", {
                title: "Select Room",
                room_list: allRooms,
                title_search: "Search Equipment By Room",
                error_message: "Please select a room.",
                search_: true,
                equipment_list: []
            });
        })
        .catch(err => {
            console.error("Error retrieving room list:", err);
            next(err);
        }); 
    }

    // Find all equipment registered in a selected room
    Equipment.find({room: room}).populate("room")
    .then((allEquipment) => { 
        return Room.findById(room)
        .then((currentRoom) => {
            if (!currentRoom) {
                throw new Error("Room not found");
            }
            res.render("search_form_room", { // Display all equipment registered in a selected room
                title: "Search Equipment By Room",
                room_list: [],
                title_search: `Equipment registered in ${currentRoom.name}`,
                error_message: null,
                search_: false,
                equipment_list: allEquipment
            });
        });  
    })
    .catch((err) => {
        console.error("Something went wrong:", err);
        next(err);
    });
})
.put((req, res, next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/all');
})
.delete((req, res, next) => { // Delete 
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/all');
});


// Search for a piece of equipment by name
equipmentRouter.route('/search/name')
.get((req, res, next) => {
    res.render ("search_form_name", {
        title: "Search Equipment By Name",
        title_search: "Search Equipment By Name",
        error_message: null,
        equipment_list: null,
        search_: true, 
        name: null
    });
})
.post((req, res, next) => { 
    Equipment.find({ name: req.body.name }).collation({locale: "en", strength: 2}) // make the query case-insensitive
    .populate("room")
    .then((equipmentFound) => {
        res.render ("search_form_name", {
            title: "Search Equipment By Name",
            title_search: "Search Equipment By Name",
            error_message: null,
            equipment_list: equipmentFound,
            search_: false, 
            name: req.body.name
        });   
    })
    .catch((err) => {
        console.error("Something went wrong:", err);
        next(err);
    });
})
.put((req, res, next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/all');
})
.delete((req, res, next) => { // Delete
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/all');
});


// Search for all equipment of a particular type
equipmentRouter.route("/search/type")
.get((req, res, next) => {
    // Get enum values from the schema
    const equipmentTypes = EquipmentType.schema.path("name").enumValues;

    res.render("search_form_type", {
        title: "Search Equipment By Type",
        title_search: "Search Equipment By Type",
        error_message: null,
        search_: true,
        equipment_list: [],
        equipment_type: null,
        equipment_types: equipmentTypes,
        type: null
    });
})
.post((req, res, next) => { 
    const type = req.body.type;
    
    if (!type) {
        // Get enum values from the schema
        const equipmentTypes = EquipmentType.schema.path("name").enumValues;
        return res.render("search_form_type", {
            title: "Search Equipment By Type",
            title_search: "Search Equipment By Type",
            error_message: "Please select type",
            search_: true,
            equipment_list: [],
            type: null,
            equipment_types: equipmentTypes
        });
    }
    
    Equipment.find({type: type}).populate("room")
    .then((allEquipment) => {
        res.render("search_form_type", {
            title: "Search Equipment By Type",
            title_search: `Equipment found By Type: ${type}`,
            error_message: null,
            search_: false,
            equipment_list: allEquipment,
            type: type,
            equipment_types: null
        });
    }) 
    .catch((err) => {
        console.error("Something went wrong:", err);
        next(err);
    });     
})
.put((req, res, next) => { // Update 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/all');
})
.delete((req, res, next) => { // Delete 
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/all');
});


// Display all equipment available in the database on GET
equipmentRouter.route('/all')
.get((req, res, next) => {
    Equipment.find().sort({name: 1}).populate("room")
    .then((allEquipment) => {
        res.render("equipment_list", {
            title: "Equipment List",
            equipment_list: allEquipment
        });
    })
    .catch((err) => {
        console.error("Error retrieving equipment list:", err);
        next(err);
    });
})
.post((req, res, next) => {  
    res.statusCode = 403;
    res.end('POST operation not supported on /equipment/all');
})
.put((req, res, next) => { // Update 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/all');
})
.delete((req, res, next) => { // Delete
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/all');
});


// Display Equipment delete form on GET
equipmentRouter.route('/:id/delete')
.get((req, res, next) => {
    // Get details about a piece of equipment 
    Equipment.findById(req.params.id).populate("room")
    .then((equipment) => {
        if(!equipment) {
            // No results
            console.log(`No results for this id: ${req.params.id}`);
            return res.render("success_page", {
                success_message: `Equipment with id ${req.params.id} not found. Please try again.`
            });
        }
        // Rendering equipment_delete
        res.render("equipment_delete", {
            title: "Delete equipment",
            error_message: null,
            equipment_list: [],
            equipment_by_id: equipment
        });
    })
    .catch(err => {
        console.error("Something went wrong: ", err.message);
        next(err);
    });
})
.post((req, res, next) => {  
    res.statusCode = 403;
    res.end('POST operation not supported on /equipment/:id');
})
.put((req, res, next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/:id');
})
.delete((req, res, next) => { // Delete 
    const { action } = req.body;
    
    // Handle cancel
    if (action === "cancel") {
        return res.redirect('/equipment');
    }

    // Proceed with deletion
    Equipment.findByIdAndDelete(req.params.id)
    .then(() => {
        // render equipment_instance_info page with success message 
        res.render("equipment_instance_info", {
            title: "Equipment deleted",
            success_message: "Equipment deleted successfully!",
            equipment_instance: null,
            isDelete: true,
            isUpdateReport: false
        });
    })
    .catch(err => {
        console.error("Something went wrong:", err);
        next(err);
    }); 
});


// Display Equipment update form on GET
equipmentRouter.route('/:id/update')
.get((req, res, next) => {
    // Get details of equipment piece 
    Equipment.findById(req.params.id).populate("room")
    .then((equipment) => {
        if(!equipment) {
            // No results
            console.log(`Equipment with id: ${req.params.id} not found`);
            const err = new Error(`Equipment with id: ${req.params.id} not found. Please try again.`);
            err.status = 404;
            return next(err);
        }
        return Room.find().sort({ name : 1})
        .then((allRooms) => {
            // Get enum values from the schema
            const equipmentTypes = EquipmentType.schema.path("name").enumValues;
            // render update form
            res.render("equipment_update", { 
                title: "Update equipment",
                piece_of_equipment: equipment,
                room_list: allRooms,
                equipment_types: equipmentTypes
            });
        })
        .catch(err => {
            console.error("Something went wrong: ", err.message);
            next(err);
        });    
    })    
    .catch(err => {
        console.error("Something went wrong: ", err.message);
        next(err);
    });
})
.post((req, res, next) => { 
    res.statusCode = 403;
    res.end('POST operation not supported on /equipment/:id');
})
.put((req, res, next) => { // Update 
    const updatedEquipmentRecord = {
        name: req.body.name.trim(),
        type: req.body.type.trim(),
        cost: Number(req.body.cost), // Cast cost to Number
        room: req.body.room,
        registeredBy: req.body.reg_name.trim(),
        dateUpdated: Date.now()
    }

    // Update the equipment record 
    Equipment.findByIdAndUpdate(req.params.id, updatedEquipmentRecord, {new: true, runValidators: true}).populate("room")
    .then((updatedEquipment) => {
        if(updatedEquipment) {
            // After successfull update, display a confirmation message
            res.render("equipment_instance_info", {
                title: 'Equipment Modified',
                success_message: 'Equipment modified successfully!',
                equipment_instance: updatedEquipment,
                isDelete: false,
                isUpdateReport: true
            });
        }
    })
    .catch(err => {
        console.error("There was an issue updating the equipment. Please try again.");
        next(err);
    });
})
.delete((req, res, next) => { // Delete 
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/:id');
});



// Display detail page for a specific equipment instance
equipmentRouter.route('/:id')
.get((req, res, next) => {
    Equipment.findById(req.params.id)
    .populate("room")
    .then((equipmentInstance) => {
        if (!equipmentInstance) {
            const err = new Error(`Equipment with id: ${req.params.id} not found.`);
            err.status = 404;
            return next(err);
        }
        res.render("equipment_instance_info", {
            title: "Equipment info",
            success_message: "Equipment Info",
            equipment_instance: equipmentInstance,
            isDelete: false,
            isUpdateReport: false
        });
    });
})
.post((req, res, next) => { 
    res.statusCode = 403;
    res.end('POST operation not supported on /equipment/:id');
})
.put((req, res, next) => { // Update 
    res.statusCode = 403;
    res.end('PUT operation not supported on /equipment/:id');
})
.delete((req, res, next) => { // Delete 
    res.statusCode = 403;
    res.end('DELETE operation not supported on /equipment/:id');
});


module.exports = equipmentRouter;