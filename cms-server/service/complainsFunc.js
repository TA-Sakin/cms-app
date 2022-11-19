const { ObjectId } = require("mongodb");
const { complainsCollection, votesCollection } = require("../model/Users");
const { citizensCollection } = require("../model/Users");

const findComplainByProperty = async (key, value) => {
  if (key === "_id") {
    return await citizensCollection.findOne({ [key]: ObjectId(value) });
  }

  return await citizensCollection.findOne({ [key]: value });
};

const getComplains = async ({ filters, page, count }) => {
  if (filters === undefined) {
    return await complainsCollection
      .find({ complainType: { $ne: "private" } })
      .sort({ _id: -1 })
      .skip(parseInt(page))
      .limit(parseInt(count))
      .toArray();
  }
  return await complainsCollection.find(filters).sort({ _id: -1 }).toArray();
};

const updateComplainsReactions = async (data) => {
  const filter = { _id: ObjectId(data.complain_id) };

  if (data.total_upvotes < 0) {
    data.total_upvotes = 0;
  }
  if (data.total_downvotes < 0) {
    data.total_downvotes = 0;
  }

  const update = {
    $set: { ...data },
  };

  return await complainsCollection.updateOne(filter, update);
};

const createNewComplain = async ({
  citizen_id,
  address,
  ward,
  description,
  attachment,
  complainType,
  category,
}) => {
  if (category) {
    const result = await complainsCollection.insertOne({
      citizen_id,
      address,
      ward,
      description,
      attachment,
      category,
      complainType,
      status: "pending approval",
      total_comments: 0,
      total_upvotes: 0,
      total_downvotes: 0,
      submission_date: new Date(),
    });

    const countOfComplains = await complainsCollection.countDocuments({
      citizen_id,
    });

    await citizensCollection.updateOne(
      { _id: citizen_id },
      { $set: { total_complaints: countOfComplains } }
    );

    return result;
  }
};

const findUserByComplain = async (uid) => {
  return await citizensCollection.findOne({ _id: ObjectId(uid) });
};

const findComplainsByUserId = (id) => {
  return complainsCollection
    .find({ citizen_id: ObjectId(id) })
    .sort({ _id: -1 })
    .toArray();
};

const deleteComplainById = (id) => {
  return complainsCollection.deleteOne({ _id: ObjectId(id) });
};

const getStatusCountByUser = async (id) => {
  let status = {};
  const pendingApproval = await complainsCollection.countDocuments({
    $and: [{ citizen_id: ObjectId(id) }, { status: "pending approval" }],
  });

  const totalComplains = await complainsCollection.countDocuments({
    citizen_id: ObjectId(id),
  });
  return (status = { pendingApproval, totalComplains });
};

const getComplainsCount = async (ward) => {
  return await complainsCollection.countDocuments({ ward });
};

const countComplainsByStatus = async (key, value) => {
  const searchBy = { [key]: value };
  if (!ward) {
    searchBy = {};
  }
  const label = "status";
  const countByStatus = await turnObjPairingCount(label, searchBy);
  return countByStatus;
};

const countComplainByCategory = async (key, value) => {
  const searchBy = { [key]: value };
  const label = "category";
  const countByCategory = await turnObjPairingCount(label, searchBy);
  return countByCategory;
};

const countComplainByType = async (key, value) => {
  const searchBy = { [key]: value };
  const label = "complainType";
  let countByType = await turnObjPairingCount(label, searchBy);
  if (!countByType.public) {
    countByType = { ...countByType, public: 0 };
  } else if (!countByType.private) {
    countByType = { ...countByType, private: 0 };
  }
  return countByType;
};

const turnObjPairingCount = async (label, search) => {
  const complains = await complainsCollection.find(search).toArray();
  if (complains.length < 1) {
    return {};
  }
  let obj = {};
  for (const complain of complains) {
    let key = complain[label];
    if (!key) continue;
    if (key.includes("public")) {
      key = "public";
    }
    if (obj[key]) {
      let count = obj[key] + 1;
      obj = {
        ...obj,
        [key]: count,
      };
    } else {
      obj = {
        ...obj,
        [key]: 1,
      };
    }
  }
  return obj;
};

module.exports = {
  createNewComplain,
  findComplainByProperty,
  getComplains,
  updateComplainsReactions,
  findUserByComplain,
  findComplainsByUserId,
  deleteComplainById,
  getStatusCountByUser,
  getComplainsCount,
  countComplainsByStatus,
  countComplainByCategory,
  countComplainByType,
};
