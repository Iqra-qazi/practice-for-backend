import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { validateServerEnvironment } from "./src/config/environment.js";

validateServerEnvironment();

try {
  await connectDB();
} catch {
  console.error("MongoDB connection failed.");
  process.exit(1);
}

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Backend listening on port ${port}.`);
});
