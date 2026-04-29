const db = require('../config/db');


exports.getAllRooms = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const capacity = parseInt(req.query.capacity) || 0;
    const checkin = req.query.checkin || null;
    const checkout = req.query.checkout || null;

    try {
        const { text, params, addParam } = createQueryBuilder();

        let sql = `SELECT * FROM "Room" WHERE capacity >= ${addParam(capacity)}`;

        if (checkin && checkout) {
            sql += `
                AND id NOT IN (
                    SELECT room_id FROM "Booking"
                    WHERE check_in < ${addParam(checkout)}
                    AND check_out > ${addParam(checkin)}
                )`;
        }

        sql += ` LIMIT ${addParam(limit)} OFFSET ${addParam(offset)}`;

        const { rows } = await db.query(sql, params);

        const rooms = rows.map(parseRoomJSON);
        res.json(rooms);

    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


function createQueryBuilder() {
    const params = [];
    const addParam = (value) => {
        params.push(value);
        return `$${params.length}`;
    };
    return { params, addParam };
}

function parseRoomJSON(room) {
    const safeParse = (val) => {
        try { return val ? JSON.parse(val) : []; }
        catch { return []; }
    };
    return {
        ...room,
        images: safeParse(room.images),
        amenities: safeParse(room.amenities),
    };
}

exports.getRoomById = async (req, res) => {
    const { id } = req.params;

    try {
        const roomResult = await db.query('SELECT * FROM "Room" WHERE id = $1', [id]);
        if (roomResult.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }
        const room = roomResult.rows[0];

        // Process images and amenities
        room.images = room.images ? JSON.parse(room.images) : [];
        room.amenities = room.amenities ? JSON.parse(room.amenities) : [];

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createRoom = async (req, res) => {
    const { name, description, price, capacity, size, amenities, payment_option, deposit_percentage } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }
    if (!name || !price) {
        return res.status(400).json({ message: 'name and price are required' });
    }
    try {
        let parsedAmenities = null;
        if (amenities) {
            parsedAmenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities);
        }
        const result = await db.query(
            'INSERT INTO "Room" (name, description, price, capacity, size, amenities, images, payment_option, deposit_percentage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [
                name,
                description,
                price,
                (capacity === '' || capacity === undefined) ? null : capacity,
                (size === '' || size === undefined) ? null : size,
                parsedAmenities,
                JSON.stringify(imagePaths),
                (payment_option === '' || payment_option === undefined) ? null : payment_option,
                (deposit_percentage === '' || deposit_percentage === undefined) ? null : deposit_percentage
            ]
        );
        const newRoom = result.rows[0];

        newRoom.amenities = newRoom.amenities ? JSON.parse(newRoom.amenities) : [];
        newRoom.images = newRoom.images ? JSON.parse(newRoom.images) : [];

        res.status(201).json(newRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, capacity, size, amenities, existingImages, payment_option, deposit_percentage } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    try {
        const check = await db.query('SELECT id FROM "Room" WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        let parsedAmenities = null;
        if (amenities) {
            parsedAmenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities);
        }

        let finalImages = null;
        if (imagePaths.length > 0) {
            finalImages = JSON.stringify(imagePaths);
        } else if (existingImages !== undefined) {
            finalImages = typeof existingImages === 'string' ? existingImages : JSON.stringify(existingImages);
        }

        const result = await db.query(
            'UPDATE "Room" SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), capacity = $4, size = $5, amenities = COALESCE($6, amenities), images = COALESCE($7, images), payment_option = $8, deposit_percentage = $9 WHERE id = $10 RETURNING *',
            [
                name,
                description,
                price,
                (capacity === '' || capacity === undefined) ? null : capacity,
                (size === '' || size === undefined) ? null : size,
                parsedAmenities,
                finalImages,
                (payment_option === '' || payment_option === undefined) ? null : payment_option,
                (deposit_percentage === '' || deposit_percentage === undefined) ? null : deposit_percentage,
                id
            ]
        );
        const updatedRoom = result.rows[0];
        updatedRoom.amenities = updatedRoom.amenities ? JSON.parse(updatedRoom.amenities) : [];
        updatedRoom.images = updatedRoom.images ? JSON.parse(updatedRoom.images) : [];
        res.json(updatedRoom);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        const check = await db.query('SELECT id FROM "Room" WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await db.query('DELETE FROM "Room" WHERE id = $1', [id]);
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
