# Smart Job Matching & Resume Analyzer

A full-stack web application that analyzes resumes, extracts skills, and matches them with job requirements to generate a match score and skill gap report.

## Problem Statement

Students often apply to jobs without knowing whether they are actually eligible. This leads to low selection rates and wasted effort. This project solves this by providing a structured skill-based matching system that compares resumes with job requirements and gives a clear match score and skill gap analysis.

## Features

- Resume input (paste or upload text)
- Skill extraction from resume content
- Job listings with required skills
- Match score calculation (0–100%)
- Skill gap analysis (missing skills)
- Suggested skills to improve
- Admin panel to add/manage job postings

## Tech Stack

Frontend: HTML, CSS, JavaScript  
Backend: Spring Boot / Node.js (Express)  
Database: MySQL  
Logic: Rule-based keyword matching system  

## How It Works

User enters resume → skills are extracted → job data fetched → skills compared → match score generated → missing skills shown

## System Flow

User Resume → Skill Extraction → Job Database → Matching Engine → Result Dashboard

## Example Output

Job Role: Backend Developer  
Match Score: 82%  
Matched Skills: Java, Spring Boot, MySQL  
Missing Skills: Docker, AWS Basics  

## Project Structure

project-root/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── application.properties
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── database/
    └── schema.sql

## Setup Instructions

1. Clone repository  
git clone https://github.com/your-username/smart-job-matcher.git  
cd smart-job-matcher  

2. Backend Setup  
Run Spring Boot or Node.js server in IDE  

3. Database Setup  
Create MySQL database and import schema.sql  

4. Frontend  
Open index.html in browser or use Live Server  

## Future Improvements

- AI-based resume parsing  
- Real-time job API integration  
- User authentication system  
- ML-based recommendation engine  
- PDF resume upload support  

## Why This Project Matters

This project demonstrates full-stack development, backend logic, database design, and real-world problem solving. It is simple, scalable, and interview-friendly.

## Author

Sritejaswi Reddy  
B.Tech CSE | Full Stack Developer | GATE Aspirant