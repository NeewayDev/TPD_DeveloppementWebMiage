const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    dateInscription: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    await User.create({ email: email.toLowerCase(), password });

    return res.status(201).json({ message: "Inscription réussie." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    return res.status(200).json({ message: "Connexion réussie.", email: user.email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});


// Serve RiffGuardian game files
app.use("/games/riff-guardian", express.static(path.join(__dirname, "..", "..", "RiffGuardian")));

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(process.env.PORT || 3000);
