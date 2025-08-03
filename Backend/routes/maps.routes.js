import express from "express";
import mapsController from "../controllers/maps.controller.js";
const router = express.Router();
import {authUser} from "../middlewares/auth.middleware.js";
import { query } from "express-validator";

router.get(
  "/geocode",
  authUser,     // here we are authenticating the user becuase if not then we have to pay to google for the api requests
  // Validate the query parameter 'address'
  query("address").isString().notEmpty(),
  mapsController.geocode
);

export default router;
