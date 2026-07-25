const app = require("./app");
const { PORT } = require("./src/config");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
