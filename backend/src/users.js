const users = [];
let nextUserId = 1;

function findUserById(id) {
  return users.find((user) => user.id === id);
}

function findUserByUsername(username) {
  return users.find((user) => user.username === username);
}

function createUser({ username, password }) {
  const user = {
    id: nextUserId,
    username,
    password,
    subscriptionTier: "free",
  };

  nextUserId += 1;
  users.push(user);
  return user;
}

function updateUserTier(id, subscriptionTier) {
  const user = findUserById(id);

  if (!user) {
    return null;
  }

  user.subscriptionTier = subscriptionTier;
  return user;
}

module.exports = {
  users,
  findUserById,
  findUserByUsername,
  createUser,
  updateUserTier,
};
