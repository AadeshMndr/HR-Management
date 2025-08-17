const db = require("../../models");
require("dotenv").config();
const message = require("../../constants/messages.json");
const { getComparator } = require("../helper/utils");
const { where } = require("sequelize");

const fs = require("fs");
const base64 = require("base64topdf");

// Utility function to convert base64 string to Buffer for database storage
const convertFileToBase64 = (base64String) => {
  if (!base64String) return null;
  try {
    return Buffer.from(base64String, 'base64');
  } catch (error) {
    console.error('Error converting base64 to buffer:', error);
    return null;
  }
};

// Utility function to convert Buffer back to base64 string for frontend
const convertBufferToBase64 = (buffer) => {
  if (!buffer) return null;
  try {
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error converting buffer to base64:', error);
    return null;
  }
};

exports.showAll = async (req, res) => {
  const data = await db.document.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  if (!data) {
    res.send("No results found");
  } else {
    // Convert BLOB data to base64 for frontend consumption
    const formattedData = data.map(doc => ({
      ...doc.toJSON(),
      documentFile: convertBufferToBase64(doc.documentFile)
    }));
    res.send(formattedData);
  }
};

exports.showOne = async (req, res) => {
  // Document entity depends on employee entity. Query of document entity will be better done using empId.
  const empid = req.params.empid;
  const data = await db.document.findAll({ where: { empId: empid } });
  if (data === null || data.length === 0) {
    res.status(200).send([]);
  } else {
    // Convert BLOB data to base64 for frontend consumption
    const formattedData = data.map(doc => ({
      ...doc.toJSON(),
      documentFile: convertBufferToBase64(doc.documentFile)
    }));
    res.status(200).send(formattedData);
  }
};

/*
exports.fectchLeavingLetterDoc = async (req, res) => {
  // Document entity depends on employee entity. Query of document entity will be better done using empId.
  const empid = "1";
  const data = await db.document.findOne({ where: { empId: empid } });
  if (data === null) {
    res.status(400).send("Not found!");
  } else {
    const base64file = data.documentFile;

    res.status(200).send(base64file);
  }
};
exports.fectchNDADoc = async (req, res) => {
  // Document entity depends on employee entity. Query of document entity will be better done using empId.
  const empid = "2";
  const data = await db.document.findOne({ where: { empId: empid } });
  if (data === null) {
    res.status(400).send("Not found!");
  } else {
    const base64file = data.documentFile;

    res.status(200).send(base64file);
  }
};
*/
exports.createBulkRecord = async (req, res) => {
  try {
    const data = await db.document.bulkCreate(req.body.data);
    console.log(req.body.data);
    res.status(201).json({ data });
  } catch (err) {
    console.log("err");
    res.send({ message: message.failed });
  }
};

exports.createRecord = async (req, res) => {
  // Note req.body.documentFile should be base64 data that needs to be converted to BLOB
  try {
    const requestData = { ...req.body };
    
    // Convert base64 string to Buffer for database storage
    if (requestData.documentFile) {
      requestData.documentFile = convertFileToBase64(requestData.documentFile);
    }
    
    const data = await db.document.create(requestData);
    
    // Convert BLOB back to base64 for response
    const responseData = {
      ...data.toJSON(),
      documentFile: convertBufferToBase64(data.documentFile)
    };
    
    res.status(201).json({ data: responseData });
  } catch (err) {
    console.log(err);
    res.send({ message: message.failed });
  }
};

exports.updateRecord = async (req, res) => {
  // Note req.body.documentFile should be base64 data that needs to be converted to BLOB
  const updatedData = { ...req.body };
  try {
    // Convert base64 string to Buffer for database storage
    if (updatedData.documentFile) {
      updatedData.documentFile = convertFileToBase64(updatedData.documentFile);
    }
    
    const data = await db.document.findByPk(updatedData.id);
    data.set(updatedData);
    await data.save();
    
    // Convert BLOB back to base64 for response
    const responseData = {
      ...data.toJSON(),
      documentFile: convertBufferToBase64(data.documentFile)
    };
    
    res.status(200).json({ message: responseData });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: message.failed });
  }
};

exports.deleteRecord = async (req, res) => {
  const id = req.params.id;
  try {
    const count = await db.document.destroy({
      where: { id: id },
    });
    if (count == 1) {
      res.send({
        message: message.deleted,
      });
    } else {
      res.send({
        message: message.failed,
      });
    }
  } catch (err) {
    res.send({
      message: err.message || message.failed,
    });
  }
};
