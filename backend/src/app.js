const app = express();

app.use(cors());
app.use(express.json());

module.exports = app;