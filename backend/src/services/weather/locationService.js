const SavedLocation = require("../models/SavedLocation");

/**
 * Get user's saved locations
 */
const getLocations = async (userId) => {
  return await SavedLocation.find({
    userId,
  }).sort({
    isFavorite: -1,
    createdAt: -1,
  });
};

/**
 * Add location
 */
const addLocation = async (
  userId,
  locationData
) => {
  const existingLocation =
    await SavedLocation.findOne({
      userId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });

  if (existingLocation) {
    const error = new Error(
      "Location is already saved"
    );
    error.statusCode = 409;
    throw error;
  }

  if (locationData.isFavorite) {
    await SavedLocation.updateMany(
      { userId },
      {
        $set: {
          isFavorite: false,
        },
      }
    );
  }

  return await SavedLocation.create({
    userId,
    ...locationData,
  });
};

/**
 * Update location
 */
const updateLocation = async (
  userId,
  locationId,
  updateData
) => {
  if (updateData.isFavorite === true) {
    await SavedLocation.updateMany(
      {
        userId,
        _id: { $ne: locationId },
      },
      {
        $set: {
          isFavorite: false,
        },
      }
    );
  }

  const location =
    await SavedLocation.findOneAndUpdate(
      {
        _id: locationId,
        userId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!location) {
    const error = new Error(
      "Location not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return location;
};

/**
 * Delete location
 */
const deleteLocation = async (
  userId,
  locationId
) => {
  const location =
    await SavedLocation.findOneAndDelete({
      _id: locationId,
      userId,
    });

  if (!location) {
    const error = new Error(
      "Location not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return location;
};

/**
 * Set favorite location
 */
const setFavorite = async (
  userId,
  locationId
) => {
  const location =
    await SavedLocation.findOne({
      _id: locationId,
      userId,
    });

  if (!location) {
    const error = new Error(
      "Location not found"
    );
    error.statusCode = 404;
    throw error;
  }

  await SavedLocation.updateMany(
    {
      userId,
      _id: { $ne: locationId },
    },
    {
      $set: {
        isFavorite: false,
      },
    }
  );

  location.isFavorite = true;

  await location.save();

  return location;
};

module.exports = {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setFavorite,
};