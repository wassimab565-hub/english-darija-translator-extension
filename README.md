# English ↔ Darija Translator (REST API, PHP Client & Chrome Extension)

This project implements a **secure RESTful web service** for translating text
between **English** and **Moroccan Arabic Dialect (Darija)** using a
**Large Language Model (LLM)**.

It combines:

* A **Java backend API (JAX-RS)**
* A **PHP client**
* A **Chrome Extension (Manifest V3)**

The main goal is to understand how **REST APIs**, **security**, and **multi-client architectures** work together in a real-world project.

---

## Project Goals

This project aims to:

* Learn how to design a **RESTful web service**
* Understand **HTTP communication with JSON**
* Secure endpoints using **Basic Authentication**
* Consume the same API from:

  * A web client (PHP)
  * A browser extension (Chrome)
* Integrate a **Large Language Model (LLM)** for NLP tasks

Each part is a new skill unlocked. Backend mastery? That’s your first **Rasengan**.

---

## Project Structure

```
english-darija-translator-extension/
├── translator-backend/            # Java REST API (JAX-RS)
│   └── src/main/java/com/darija/api/
│       ├── RestApplication.java
│       ├── TranslatorResource.java
│       └── BasicAuthFilter.java
│
├── php-client/                    # PHP client
│   └── index.php
│
├── chrome-extension/              # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── sidepanel.html
│   ├── script.js
│   ├── style.css
│   └── content.js
│
└── README.md
```

---

## Backend – REST API (JAX-RS)

The backend is implemented in **Java using JAX-RS**.

Main components:

* `RestApplication.java`: REST configuration
* `TranslatorResource.java`: Main translation endpoint
* `BasicAuthFilter.java`: Security filter

### Example Endpoints

* `GET /api/translator/ping`
  Used to test if the service is alive.

* `POST /api/translator/translate`
  Accepts JSON input and returns translated text.

All communication uses **JSON over HTTP**.

---

## LLM Integration

The translation is performed using a **Large Language Model (LLM)** via an external API (Gemini).

The backend sends a structured prompt to the model and receives:

* English → Darija
* Darija → English

This makes the system flexible and easily extendable to other languages.

Working theory: the LLM is basically a very fast multilingual jinn trapped in a server.

---

## Security – Basic Authentication

The `/translate` endpoint is protected using **HTTP Basic Authentication**.

Behavior:

* No credentials → `401 Unauthorized`
* Invalid credentials → `401 Unauthorized`
* Valid credentials → `200 OK`

This ensures that only authorized clients can use the API.

---

## PHP Client

A simple **PHP client** demonstrates how a traditional web app can consume the API.

Features:

* Input field for text
* Translation direction toggle (English ↔ Darija)
* Sends authenticated request
* Displays translation result

This proves that the backend is not tied to any specific frontend.

---

## Chrome Extension (Manifest V3)

A Chrome Extension was built using **Manifest Version 3**.

Main features:

* Side panel UI
* Text input
* Translation direction toggle (English ↔ Darija)
* REST API calls with authentication
* Automatically copies selected text from the active page

In shinobi terms: instant translation no hand signs required.

---

## Testing

The REST API can be tested using:

* cURL
* Postman

Test scenarios:

* Valid request → `200 OK`
* Missing data → `400 Bad Request`
* No auth → `401 Unauthorized`

---

## Technologies Used

* Java / Jakarta EE / JAX-RS
* Large Language Model API (Gemini)
* PHP
* JavaScript, HTML, CSS
* Chrome Extension (Manifest V3)
* Maven
* Git & GitHub
* Postman / cURL

---

## Possible Improvements

Future upgrades (next arcs):

* JWT instead of Basic Auth
* User accounts
* Voice input (SpeechRecognition API)
* Text-to-Speech
* Deploy backend on cloud (Docker / VPS)

That’s basically going from Genin to Hokage.

---

## Author

* Name: Wassim Abeloue
