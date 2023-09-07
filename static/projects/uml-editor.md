---
title: UML Editor
description: odo App for practicing basic skills of Flutter and implementing UI/UX.
dateString: 2021
photoUrls:
  [
    "uml-editor/1.webp",
    "uml-editor/2.webp",
    "uml-editor/3.webp",
    "uml-editor/4.webp",
  ]
index: 70
---

A tool for drawing UML Diagram. This tool was developed during an Object-Oriented Programming and Design course, and I often use it to verify my own ideas about code architecture. I used Java to develop it, and this time I was challenged to use the Awt and Swing packages with no graphical preview interface compared to JavaFX, which I used in last couple of projects.

## Tech Stack

- Java/Awt/Swing

## Features

- Draw UML objects: Class and Use Case.
- Drag and drop objects as you like.
- Connect UML lines between UML objects: Association Line, Generalization Line, and Composition Line.
- When you want to change the type of line, just link the new line, the system will replace it with the latest line, no need to delete and link again.
- Rename objects.
- When you select multiple objects, you can group objects, and the grouped object can also contain grouped objects.
- Ungroup grouped objects.
