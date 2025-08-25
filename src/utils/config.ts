import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  allowedHeaders: ["Content-Type", "Authorization"],
  origin: ["http://localhost:5173"],
};
