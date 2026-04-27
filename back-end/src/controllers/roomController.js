const db = require('../config/db');

exports.getAllRooms = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Room"');
        const rooms = result.rows;

        // Fetch images for these rooms
        for (let room of rooms) {
            const imageResult = await db.query('SELECT * FROM "Image" WHERE room_id = $1', [room.id]);
            room.images = imageResult.rows;
            room.amenities = room.amenities ? JSON.parse(room.amenities) : [];
        }

        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const roomResult = await db.query('SELECT * FROM "Room" WHERE id = $1', [id]);
        if (roomResult.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }
        const room = roomResult.rows[0];

        // get images for the room
        const imageResult = await db.query('SELECT * FROM "Image" WHERE room_id = $1', [id]);
        room.images = imageResult.rows;
        room.amenities = room.amenities ? JSON.parse(room.amenities) : [];

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createRoom = async (req, res) => {
    const { name, description, price, capacity, size, amenities } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: 'name and price are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO "Room" (name, description, price, capacity, size, amenities) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, capacity || null, size || null, amenities ? JSON.stringify(amenities) : null]
        );
        const newRoom = result.rows[0];
        newRoom.amenities = newRoom.amenities ? JSON.parse(newRoom.amenities) : [];
        res.status(201).json(newRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, capacity, size, amenities } = req.body;

    try {
        const check = await db.query('SELECT id FROM "Room" WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const result = await db.query(
            'UPDATE "Room" SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), capacity = COALESCE($4, capacity), size = COALESCE($5, size), amenities = COALESCE($6, amenities) WHERE id = $7 RETURNING *',
            [name, description, price, capacity !== undefined ? capacity : null, size !== undefined ? size : null, amenities ? JSON.stringify(amenities) : null, id]
        );
        const updatedRoom = result.rows[0];
        updatedRoom.amenities = updatedRoom.amenities ? JSON.parse(updatedRoom.amenities) : [];
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

exports.addImageToRoom = async (req, res) => {
    const { roomId } = req.params;
    const { url, description } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'url is required' });
    }

    try {
        const check = await db.query('SELECT id FROM "Room" WHERE id = $1', [roomId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const result = await db.query(
            'INSERT INTO "Image" (room_id, url, description) VALUES ($1, $2, $3) RETURNING *',
            [roomId, url, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteImage = async (req, res) => {
    const { id } = req.params;

    try {
        const check = await db.query('SELECT id FROM "Image" WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        await db.query('DELETE FROM "Image" WHERE id = $1', [id]);
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
