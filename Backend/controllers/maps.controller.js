import mapsService from "../services/maps.service.js";
import { validationResult } from "express-validator";

const geocode = async (req, res, next) => {
  // Validate request parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.query;

  try {
    // Call the service to get coordinates
    const coordinates = await mapsService.getCoordinates(address);
    return res.status(200).json(coordinates);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  geocode,
};
