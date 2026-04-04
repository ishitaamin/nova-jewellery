import Address from "../models/Address.js";

// GET all addresses
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

// ADD address
export const addAddress = async (req, res, next) => {
  try {
    const address = await Address.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) return res.status(404).json({ message: "Address not found" });

    // Ensure the user owns this address before updating
    if (address.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to update this address" });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json(address);
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Ensure the user owns this address before deleting
    if (address.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to delete this address" });
    }

    await address.deleteOne();
    res.json({ message: "Address deleted" });
  } catch (error) {
    next(error);
  }
};