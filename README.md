# Trust Issues -Food Edition

Understand what is actually inside packaged food.

Trust Issues — Food Edition is an ingredient intelligence system that analyzes product ingredient lists and identifies potentially harmful, allergenic, or unknown substances using NLP-based normalization and a structured ingredient ontology.

The system is designed to reduce ambiguity in ingredient labeling by mapping complex chemical names and synonyms into meaningful classifications that users can understand.

---

## Problem Statement

Ingredient labels often contain scientific or unfamiliar terminology that makes it difficult for consumers to assess safety.

Examples:
- Ascorbic Acid → Vitamin C
- Tocopherol → Vitamin E
- Casein → Milk derivative
- Maltodextrin → Highly processed carbohydrate

Users frequently struggle to identify:
- allergens
- artificial additives
- potentially harmful chemicals
- ambiguous ingredient aliases

This project aims to bridge that gap using machine learning preprocessing and structured knowledge mapping.

---

## Core Features

Ingredient analysis engine capable of:

• Detecting known harmful or controversial ingredients  
• Identifying allergen-related ingredients  
• Flagging unknown or unrecognized ingredients  
• Handling "may contain traces of" warnings  
• Normalizing ingredient names using NLP techniques  
• Mapping synonyms to canonical ingredient names  
• Fast lookup using Redis caching  
• Extensible ingredient ontology  

---

## Tech Stack

### Frontend
- React / Expo
- JavaScript
- REST API integration

### Backend
- Node.js
- Express
- Postgre - NeonDB
- Redis

### NLP
- TF-IDF vectorization
- text normalization
- tokenization
- stemming
- synonym mapping

### Infrastructure
- Docker
- CI pipeline ready structure

---

## Project Structure

Designed with separation of concerns and scalability in mind.
trust-issues-food-edition
│
├── apps/
│ ├── frontend/ # user interface
│ └── backend/ # API server
│
├── packages/
│ ├── ontology/ # ingredient dictionary & mappings
│ └── normalization/ # NLP preprocessing logic
│
├── docs/ # technical documentation
│
├── infrastructure/ # docker / CI configs 
│
├── .env.example
├── README.md
├── LICENSE
└── .gitignore


---

## System Architecture Overview

Input:
ingredient list from packaged food label

Processing pipeline:

1. text preprocessing
2. tokenization
3. normalization
4. synonym mapping
5. ontology lookup
6. risk classification
7. caching for faster repeated queries

Output:
structured ingredient analysis with safety indicators.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /analyze | analyze ingredient list |
| GET | /ingredient/:name | lookup ingredient |
| GET | /health | service health check |

Detailed API documentation available in `/docs/api-spec.md`.

---

## Design Goals

- interpretability of ingredient names
- fast lookup performance
- extensible ontology structure
- modular architecture
- production-oriented code organization

---

## Current Status

Active development.

Focus areas:
- ontology expansion
- ingredient normalization accuracy
- API stability
- performance optimization

---

## Future Improvements

- severity scoring for ingredients
- barcode scanning integration
- multilingual ingredient support
- offline lookup cache
- personalized allergen profiles

---

## Contributing

Contributions are welcome.

Suggested workflow:

1. fork repository
2. create feature branch
3. commit changes
4. open pull request

---

## License

MIT License

