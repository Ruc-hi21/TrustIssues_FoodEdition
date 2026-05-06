import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name"),
    email: text("email").unique().notNull(),
    preferredLanguage: text("preferred_language").default("en"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    clerkIdIdx: uniqueIndex("users_clerk_id_idx").on(t.clerkId),
  })
);

// ─────────────────────────────────────────
// USER ALLERGENS
// ─────────────────────────────────────────
export const userAllergens = pgTable(
  "user_allergens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    allergen: text("allergen").notNull(),
    severity: text("severity").default("unknown"), // mild | moderate | severe | unknown
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniqueUserAllergen: uniqueIndex("user_allergens_user_allergen_idx").on(
      t.userId,
      t.allergen
    ),
    userIdIdx: index("user_allergens_user_id_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────
// PETS  (optional — users may have zero)
// Dogs and cats only
// ─────────────────────────────────────────
export const pets = pgTable(
  "pets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    species: text("species").notNull(), // "dog" | "cat"
    breed: text("breed"),
    weightKg: real("weight_kg"),
    birthYear: integer("birth_year"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    userIdIdx: index("pets_user_id_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────
// PET ALLERGENS
// ─────────────────────────────────────────
export const petAllergens = pgTable(
  "pet_allergens",
  {
    id: serial("id").primaryKey(),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    allergen: text("allergen").notNull(),
    severity: text("severity").default("unknown"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniquePetAllergen: uniqueIndex("pet_allergens_pet_allergen_idx").on(
      t.petId,
      t.allergen
    ),
  })
);

// ─────────────────────────────────────────
// PET HAZARD INGREDIENTS
// Owner-flagged ingredients beyond the built-in toxin list
// ─────────────────────────────────────────
export const petHazardIngredients = pgTable(
  "pet_hazard_ingredients",
  {
    id: serial("id").primaryKey(),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    ingredient: text("ingredient").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniquePetHazard: uniqueIndex("pet_hazard_ingredients_pet_ing_idx").on(
      t.petId,
      t.ingredient
    ),
  })
);

// ─────────────────────────────────────────
// SCANS
// ─────────────────────────────────────────
export const scans = pgTable(
  "scans",
  {
    id: serial("id").primaryKey(),
    scanUuid: text("scan_uuid").unique().notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // OCR
    rawOcrText: text("raw_ocr_text"),
    ocrConfidence: real("ocr_confidence"),
    ocrEngine: text("ocr_engine").default("tesseract"),

    // External API
    externalSource: text("external_source"),         // "open_food_facts" | null
    externalConfidence: text("external_confidence"), // "high" | "medium" | "low" | null

    // Parsed product info
    productName: text("product_name"),
    ingredientsRaw: text("ingredients_raw"),
    ingredientsList: text("ingredients_list").array(),

    // Full analysis result (stored as JSONB)
    analysis: jsonb("analysis"),

    // Status & source
    status: text("status").default("pending"), // pending | processing | completed | failed
    errorMessage: text("error_message"),
    inputSource: text("input_source").default("upload"), // camera | upload

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    userIdIdx: index("scans_user_id_idx").on(t.userId),
    statusIdx: index("scans_status_idx").on(t.status),
    scanUuidIdx: uniqueIndex("scans_uuid_idx").on(t.scanUuid),
  })
);

// ─────────────────────────────────────────
// SCAN INGREDIENTS  (normalised, one row per ingredient per scan)
// ─────────────────────────────────────────
export const scanIngredients = pgTable(
  "scan_ingredients",
  {
    id: serial("id").primaryKey(),
    scanId: integer("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    ingredient: text("ingredient").notNull(),
    isAllergen: boolean("is_allergen").default(false),
    isPetHazard: boolean("is_pet_hazard").default(false),
    hazardLevel: text("hazard_level"), // safe | caution | danger | deadly
    matchedRule: text("matched_rule"),
  },
  (t) => ({
    scanIdIdx: index("scan_ingredients_scan_id_idx").on(t.scanId),
  })
);

// ─────────────────────────────────────────
// SCAN PET RESULTS  (one row per pet per scan)
// ─────────────────────────────────────────
export const scanPetResults = pgTable(
  "scan_pet_results",
  {
    id: serial("id").primaryKey(),
    scanId: integer("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    isSafe: boolean("is_safe"),
    severity: text("severity"), // safe | caution | danger | deadly
    flaggedItems: text("flagged_items").array(),
    detail: jsonb("detail"),
  },
  (t) => ({
    scanIdIdx: index("scan_pet_results_scan_id_idx").on(t.scanId),
  })
);

// ─────────────────────────────────────────
// DRIZZLE RELATIONS  (for relational queries)
// ─────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  allergens: many(userAllergens),
  pets: many(pets),
  scans: many(scans),
}));

export const userAllergensRelations = relations(userAllergens, ({ one }) => ({
  user: one(users, { fields: [userAllergens.userId], references: [users.id] }),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  user: one(users, { fields: [pets.userId], references: [users.id] }),
  allergens: many(petAllergens),
  hazardIngredients: many(petHazardIngredients),
  scanResults: many(scanPetResults),
}));

export const petAllergensRelations = relations(petAllergens, ({ one }) => ({
  pet: one(pets, { fields: [petAllergens.petId], references: [pets.id] }),
}));

export const petHazardIngredientsRelations = relations(petHazardIngredients, ({ one }) => ({
  pet: one(pets, { fields: [petHazardIngredients.petId], references: [pets.id] }),
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  user: one(users, { fields: [scans.userId], references: [users.id] }),
  ingredients: many(scanIngredients),
  petResults: many(scanPetResults),
}));

export const scanIngredientsRelations = relations(scanIngredients, ({ one }) => ({
  scan: one(scans, { fields: [scanIngredients.scanId], references: [scans.id] }),
}));

export const scanPetResultsRelations = relations(scanPetResults, ({ one }) => ({
  scan: one(scans, { fields: [scanPetResults.scanId], references: [scans.id] }),
  pet: one(pets, { fields: [scanPetResults.petId], references: [pets.id] }),
}));