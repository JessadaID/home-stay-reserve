const db = require('../config/db');

exports.getMap = async (req, res) => {
    try {
        const mapResult = await db.query('SELECT * FROM "Map" LIMIT 1');
        if (mapResult.rows.length === 0) {
            return res.status(404).json({ message: 'Map not found' });
        }

        const map = mapResult.rows[0];
        const markerResult = await db.query('SELECT * FROM "Marker" WHERE map_id = $1', [map.id]);
        map.markers = markerResult.rows;

        res.json(map);
    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createMap = async (req, res) => {
    const { image_url } = req.body;

    if (!image_url) {
        return res.status(400).json({ message: 'image_url is required' });
    }

    try {
        const existingMap = await db.query('SELECT id FROM "Map"');
        if (existingMap.rows.length > 0) {
            return res.status(400).json({ message: 'Map already exists' });
        }

        const result = await db.query(
            'INSERT INTO "Map" (image_url) VALUES ($1) RETURNING *',
            [image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating map:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateMap = async (req, res) => {
    const { id } = req.params;
    const { image_url } = req.body;

    try {
        const result = await db.query(
            'UPDATE "Map" SET image_url = $1 WHERE id = $2 RETURNING *',
            [image_url, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating map:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createMarker = async (req, res) => {
    const { mapId } = req.params;
    const { room_id, x_coordinate, y_coordinate } = req.body;

    if (!room_id || x_coordinate === undefined || y_coordinate === undefined) {
        return res.status(400).json({ message: 'room_id, x_coordinate, and y_coordinate are required' });
    }

    try {
        const mapCheck = await db.query('SELECT id FROM "Map" WHERE id = $1', [mapId]);
        if (mapCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Map not found' });
        }

        const result = await db.query(
            'INSERT INTO "Marker" (map_id, room_id, x_coordinate, y_coordinate) VALUES ($1, $2, $3, $4) RETURNING *',
            [mapId, room_id, x_coordinate, y_coordinate]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating marker:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateMarker = async (req, res) => {
    const { id } = req.params;
    const { x_coordinate, y_coordinate } = req.body;

    try {
        const result = await db.query(
            'UPDATE "Marker" SET x_coordinate = COALESCE($1, x_coordinate), y_coordinate = COALESCE($2, y_coordinate) WHERE id = $3 RETURNING *',
            [x_coordinate, y_coordinate, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating marker:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteMarker = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM "Marker" WHERE id = $1', [id]);
        res.json({ message: 'Marker deleted successfully' });
    } catch (error) {
        console.error('Error deleting marker:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
