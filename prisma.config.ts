export default {
  datasources: {
    db: {
      provider: "mongodb",
      url: process.env.MONGODB_URI || "mongodb://localhost:27017/students-management",
    },
  },
};
