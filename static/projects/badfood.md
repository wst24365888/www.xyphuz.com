---
title: Badfood
description: A system that can report problems after eating something.
dateString: 2021
photoUrls:
  [
    "badfood/screenshot-1.webp", 
    "badfood/screenshot-2.webp", 
    "badfood/screenshot-3.webp", 
    "badfood/screenshot-4.webp", 
  ]
index: 1
---

Cooperate with Chang Jung Christian University's Department of Food Hygiene and Safety and biotechnology company GeneMessenger to create a system that can report problems after eating something. The development uses Flutter as the front-end, to make a dual-platform App and a Single Page Web App, Laravel as the back-end (mainly develop by my partner, I help develop two API of the RESTful API), and connects to Firebase, and various Google services (Google OAuth, Map API, Place API).

## Tech Stack
- Dart/Flutter
- Laravel
- Firebase
- Various Google API

## Functionalities

- Report bad food, directly connected to the Google Map API so that users can accurately report the store.
- View the reported stores in each region, or directly use Google Map to view the nearby store notification records.
- View your own notification records and be able to track the follow-up results or related notification records.
- When the number of notifications reaches a certain level, ask the health authorities to conduct an audit (still in coordination).